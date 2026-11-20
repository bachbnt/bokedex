/**
 * Build-time data pipeline: turns PokeAPI's published data into the compact, bilingual datasets the app ships.
 *
 *   npm run ingest              build (skipped when the source has not changed)
 *   npm run ingest -- --update  pull the newest PokeAPI data first
 *   npm run ingest -- --force   rebuild even if nothing changed
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { DataManifest, ReferenceData, TypeRow } from '#shared/types/encyclopedia'
import { buildAbilities, buildItems } from '#ingest/build/items'
import { buildMoves, readMachines } from '#ingest/build/moves'
import { buildPokemon } from '#ingest/build/pokemon'
import { buildEggGroups, buildGames, buildGenerations, buildGrowthRates, buildNatures, buildPokedexes, buildTypes } from '#ingest/build/reference'
import { buildSearchIndex } from '#ingest/build/search'
import { buildTaxonomy, missingJapanese } from '#ingest/build/taxonomy'
import { buildAreaRefs, buildWorld } from '#ingest/build/world'
import { GENERATED_DIR, PUBLIC_DIR, resetOutputs, writeJson } from '#ingest/out'
import { ensureSource } from '#ingest/source'

/** Bump when the shape of the generated data changes, so stale output is never reused. */
const SCHEMA = 1

const args = new Set(process.argv.slice(2))

function isUpToDate(sourceCommit: string): boolean {
  const manifestPath = join(GENERATED_DIR, 'manifest.json')
  if (args.has('--force') || !existsSync(manifestPath) || !existsSync(join(PUBLIC_DIR, 'manifest.json'))) return false
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as DataManifest
  return manifest.schema === SCHEMA && manifest.sourceCommit === sourceCommit
}

function step<T>(label: string, run: () => T): T {
  const started = performance.now()
  const result = run()
  console.log(`  ${label.padEnd(28)} ${((performance.now() - started) / 1000).toFixed(1)}s`)
  return result
}

function main(): void {
  const sourceCommit = ensureSource(args.has('--update'))
  if (isUpToDate(sourceCommit)) {
    console.log(`Data is up to date (PokeAPI ${sourceCommit.slice(0, 7)}). Use --force to rebuild.`)
    return
  }

  console.log(`Building data from PokeAPI ${sourceCommit.slice(0, 7)}...`)
  resetOutputs()

  const machines = step('machines', readMachines)
  const games = step('games', () => buildGames(machines))
  const versionGroupOrder = new Map(games.versionGroups.map(group => [group.slug, group.order]))
  const areaRefs = step('location areas', buildAreaRefs)
  const pokemon = step('pokemon, forms, learnsets', () => buildPokemon(versionGroupOrder, areaRefs))
  const world = step('locations, regions', () => buildWorld(pokemon.speciesByPokemonId))
  const moves = step('moves', () => buildMoves(pokemon.speciesByPokemonId, machines))
  const abilities = step('abilities', () => buildAbilities(pokemon.speciesByPokemonId))
  const items = step('items, berries', () => buildItems(pokemon.speciesByPokemonId, machines))
  const usedTypes = new Set(pokemon.dex.flatMap(entry => entry.types))
  const types = step('types', () => buildTypes(pokemon.speciesByPokemonId, usedTypes))
  const natures = step('natures', buildNatures)
  const generations = step('generations', buildGenerations)
  const pokedexes = step('pokedexes', buildPokedexes)
  const growthRates = step('growth rates', buildGrowthRates)
  const eggGroups = step('egg groups', buildEggGroups)
  const taxonomy = step('taxonomy', buildTaxonomy)
  for (const group of games.versionGroups) taxonomy['version-group'][group.slug] = group.names

  step('write entities', () => {
    for (const species of pokemon.species) writeJson(GENERATED_DIR, `entities/pokemon/${species.id}.json`, species)
    for (const move of moves.entries) writeJson(GENERATED_DIR, `entities/moves/${move.slug}.json`, move)
    for (const ability of abilities.entries) writeJson(GENERATED_DIR, `entities/abilities/${ability.slug}.json`, ability)
    for (const item of items.entries) writeJson(GENERATED_DIR, `entities/items/${item.slug}.json`, item)
    for (const location of world.locations) writeJson(GENERATED_DIR, `entities/locations/${location.slug}.json`, location)
    for (const type of types) writeJson(GENERATED_DIR, `entities/types/${type.slug}.json`, type)
    for (const generation of generations) writeJson(GENERATED_DIR, `entities/generations/${generation.id}.json`, generation)
    for (const group of games.versionGroups) writeJson(GENERATED_DIR, `entities/games/${group.slug}.json`, group)
    for (const pokedex of pokedexes) writeJson(GENERATED_DIR, `entities/pokedexes/${pokedex.slug}.json`, pokedex)
    for (const region of world.regions) writeJson(GENERATED_DIR, `entities/regions/${region.slug}.json`, region)
    for (const group of eggGroups) writeJson(GENERATED_DIR, `entities/egg-groups/${group.slug}.json`, group)
  })

  step('write published data', () => {
    const typeRows: TypeRow[] = types.map(type => ({ slug: type.slug, names: type.names, relations: type.relations, hasPokemon: type.hasPokemon }))
    const reference: ReferenceData = {
      generations: generations.map(generation => ({ id: generation.id, slug: generation.slug, names: generation.names, region: generation.region })),
      versions: games.versions,
      versionGroups: games.versionGroups.map(group => ({ slug: group.slug, names: group.names, generation: group.generation, order: group.order, versions: group.versions })),
      regions: world.regions.map(region => ({ slug: region.slug, names: region.names })),
      pokedexes: pokedexes.map(pokedex => ({ slug: pokedex.slug, names: pokedex.names, region: pokedex.region, mainSeries: pokedex.mainSeries, count: pokedex.entries.length })),
      growthRates,
      eggGroups: eggGroups.map(group => ({ slug: group.slug, names: group.names, count: group.species.length })),
      natures,
    }

    writeJson(PUBLIC_DIR, 'dex.json', pokemon.dex)
    writeJson(PUBLIC_DIR, 'pokemon-table.json', pokemon.rows)
    writeJson(PUBLIC_DIR, 'moves.json', moves.rows)
    writeJson(PUBLIC_DIR, 'abilities.json', abilities.rows)
    writeJson(PUBLIC_DIR, 'items.json', items.rows)
    writeJson(PUBLIC_DIR, 'berries.json', items.berries)
    writeJson(PUBLIC_DIR, 'locations.json', world.rows)
    writeJson(PUBLIC_DIR, 'types.json', typeRows)
    writeJson(PUBLIC_DIR, 'reference.json', reference)
    writeJson(PUBLIC_DIR, 'taxonomy.json', taxonomy)
    for (const [pokemonId, learnset] of pokemon.learnsets) writeJson(PUBLIC_DIR, `learnsets/${pokemonId}.json`, learnset)
    for (const [pokemonId, encounters] of pokemon.encounters) writeJson(PUBLIC_DIR, `encounters/${pokemonId}.json`, encounters)
    writeJson(PUBLIC_DIR, 'search.json', buildSearchIndex({
      species: pokemon.species,
      moves: moves.rows,
      abilities: abilities.rows,
      items: items.rows,
      locations: world.rows,
      natures,
      types,
    }))
  })

  const routes = [
    ...pokemon.species.flatMap(species => [
      `/pokemon/${species.id}`,
      ...species.forms.filter(form => form.formSlug && form.kind !== 'cosmetic').map(form => `/pokemon/${species.id}/${form.formSlug}`),
    ]),
    ...moves.entries.map(move => `/moves/${move.slug}`),
    ...abilities.entries.map(ability => `/abilities/${ability.slug}`),
    ...items.entries.map(item => `/items/${item.slug}`),
    ...world.locations.map(location => `/locations/${location.slug}`),
    ...types.filter(type => type.hasPokemon).map(type => `/types/${type.slug}`),
    ...generations.map(generation => `/generations/${generation.id}`),
    ...games.versionGroups.map(group => `/games/${group.slug}`),
    ...pokedexes.map(pokedex => `/pokedex/${pokedex.slug}`),
    ...world.regions.map(region => `/regions/${region.slug}`),
    ...eggGroups.map(group => `/egg-groups/${group.slug}`),
  ]
  writeJson(GENERATED_DIR, 'routes.json', routes)

  const manifest: DataManifest = {
    schema: SCHEMA,
    generatedAt: new Date().toISOString(),
    sourceCommit,
    counts: {
      species: pokemon.species.length,
      forms: pokemon.species.reduce((sum, species) => sum + species.forms.length, 0),
      moves: moves.entries.length,
      abilities: abilities.entries.length,
      items: items.entries.length,
      locations: world.locations.length,
      pages: routes.length,
    },
  }
  writeJson(GENERATED_DIR, 'manifest.json', manifest)
  writeJson(PUBLIC_DIR, 'manifest.json', manifest)

  console.log('Done:', manifest.counts)
  const missing = missingJapanese(taxonomy)
  const missingTotal = Object.values(missing).reduce((sum, list) => sum + list.length, 0)
  if (missingTotal) console.log(`Taxonomy terms still without Japanese: ${missingTotal}`, args.has('--audit') ? missing : '(run with --audit to list)')
}

main()
