import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { DexEntry, MoveRow, Taxonomy, TypeRow } from '#shared/types/encyclopedia'

const root = process.cwd()
const generated = join(root, 'data', 'generated')
const published = join(root, 'public', 'data')
const ready = existsSync(join(generated, 'manifest.json'))
const read = <T>(path: string) => JSON.parse(readFileSync(path, 'utf8')) as T

// These check the output of `npm run ingest`; they are skipped until it has run.
describe.skipIf(!ready)('generated data', () => {
  const dex = ready ? read<DexEntry[]>(join(published, 'dex.json')) : []
  const moves = ready ? read<MoveRow[]>(join(published, 'moves.json')) : []
  const types = ready ? read<TypeRow[]>(join(published, 'types.json')) : []
  const taxonomy = ready ? read<Taxonomy>(join(published, 'taxonomy.json')) : ({} as Taxonomy)

  it('lists every Pokémon once, with a name in both languages', () => {
    expect(dex.length).toBeGreaterThan(1000)
    expect(new Set(dex.map(entry => entry.id)).size).toBe(dex.length)
    expect(dex.filter(entry => !entry.names.en || !entry.names.ja)).toEqual([])
    expect(dex.filter(entry => !entry.types.length)).toEqual([])
  })

  it('only uses types that exist', () => {
    const known = new Set(types.map(type => type.slug))
    expect(dex.flatMap(entry => entry.types).filter(type => !known.has(type))).toEqual([])
    expect(moves.map(move => move.type).filter(type => !known.has(type))).toEqual([])
  })

  it('has a type chart that is complete and symmetric in meaning', () => {
    const playable = types.filter(type => type.hasPokemon)
    expect(playable).toHaveLength(18)
    const fire = types.find(type => type.slug === 'fire')!
    expect(fire.relations.doubleTo).toContain('grass')
    expect(types.find(type => type.slug === 'grass')!.relations.doubleFrom).toContain('fire')
  })

  it('translates the lookup tables players see most', () => {
    for (const kind of ['stat', 'damage-class', 'item-pocket', 'habitat', 'move-target'] as const) {
      const missing = Object.entries(taxonomy[kind]).filter(([, names]) => !names.ja).map(([slug]) => slug)
      expect(missing, `${kind} is missing Japanese`).toEqual([])
    }
  })

  it('has an entity file for every route the site will build', () => {
    const routes = read<string[]>(join(generated, 'routes.json'))
    const folder: Record<string, string> = { pokemon: 'pokemon', moves: 'moves', abilities: 'abilities', items: 'items', locations: 'locations', types: 'types', generations: 'generations', games: 'games', pokedex: 'pokedexes', regions: 'regions', 'egg-groups': 'egg-groups' }
    const missing = routes.filter((route) => {
      const [, kind, key] = route.split('/')
      return !existsSync(join(generated, 'entities', folder[kind!]!, `${key}.json`))
    })
    expect(missing).toEqual([])
  })

  it('has a learnset file for every Pokémon form', () => {
    for (const entry of dex) expect(existsSync(join(published, 'learnsets', `${entry.id}.json`)), `learnset ${entry.id}`).toBe(true)
  })
})
