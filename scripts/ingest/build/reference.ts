import type {
  EggGroupEntry,
  GenerationEntry,
  GrowthRateEntry,
  NatureEntry,
  PokedexEntry,
  Text,
  TypeEntry,
  VersionEntry,
  VersionGroupEntry,
} from '#shared/types/encyclopedia'
import { names } from '#ingest/l10n'
import type { Machine } from '#ingest/build/moves'
import type {
  RawEggGroup,
  RawGeneration,
  RawGrowthRate,
  RawNature,
  RawPokedex,
  RawType,
  RawVersion,
  RawVersionGroup,
} from '#ingest/raw'
import { idFromUrl, readAll } from '#ingest/source'

const slugs = (refs: { name: string }[]) => refs.map(ref => ref.name)

export function buildTypes(speciesByPokemonId: Map<number, number>, usedTypes: Set<string>): TypeEntry[] {
  return readAll<RawType>('type').map((raw) => {
    const relations = raw.damage_relations
    return {
      id: raw.id,
      slug: raw.name,
      names: names(raw.names, raw.name),
      generation: idFromUrl(raw.generation.url),
      damageClass: raw.move_damage_class?.name ?? null,
      relations: {
        doubleTo: slugs(relations.double_damage_to),
        halfTo: slugs(relations.half_damage_to),
        noTo: slugs(relations.no_damage_to),
        doubleFrom: slugs(relations.double_damage_from),
        halfFrom: slugs(relations.half_damage_from),
        noFrom: slugs(relations.no_damage_from),
      },
      moves: slugs(raw.moves),
      pokemon: [...new Set(raw.pokemon.flatMap((entry) => {
        const species = speciesByPokemonId.get(idFromUrl(entry.pokemon.url))
        return species === undefined ? [] : [species]
      }))].sort((a, b) => a - b),
      hasPokemon: usedTypes.has(raw.name),
    }
  })
}

export function buildNatures(): NatureEntry[] {
  return readAll<RawNature>('nature').map(raw => ({
    id: raw.id,
    slug: raw.name,
    names: names(raw.names, raw.name),
    increasedStat: raw.increased_stat?.name ?? null,
    decreasedStat: raw.decreased_stat?.name ?? null,
    likesFlavor: raw.likes_flavor?.name ?? null,
    hatesFlavor: raw.hates_flavor?.name ?? null,
  }))
}

export function buildGenerations(): GenerationEntry[] {
  return readAll<RawGeneration>('generation').map(raw => ({
    id: raw.id,
    slug: raw.name,
    names: names(raw.names, raw.name),
    region: raw.main_region?.name ?? null,
    versionGroups: slugs(raw.version_groups),
    species: raw.pokemon_species.map(species => idFromUrl(species.url)).sort((a, b) => a - b),
    moves: slugs(raw.moves),
    abilities: slugs(raw.abilities),
    types: slugs(raw.types),
  }))
}

/** `tm24` -> ['tm', 24]: sort machines the way players read them. */
function machineOrder(item: string): [string, number] {
  const match = /^([a-z]+)(\d+)/.exec(item)
  return [match?.[1] ?? item, Number(match?.[2] ?? 0)]
}

export function buildGames(machines: Map<number, Machine>): { versions: VersionEntry[], versionGroups: VersionGroupEntry[] } {
  const versions: VersionEntry[] = readAll<RawVersion>('version').map(raw => ({
    slug: raw.name,
    names: names(raw.names, raw.name),
    versionGroup: raw.version_group.name,
  }))
  const versionNames = new Map(versions.map(version => [version.slug, version.names]))

  const versionGroups: VersionGroupEntry[] = readAll<RawVersionGroup>('version-group').map((raw) => {
    const members = slugs(raw.versions)
    const joined = (pick: 'en' | 'ja', separator: string) =>
      members.map(member => versionNames.get(member)?.[pick] ?? versionNames.get(member)?.en ?? member).join(separator)
    const hasJa = members.every(member => versionNames.get(member)?.ja)

    return {
      slug: raw.name,
      names: { en: joined('en', ' / '), ...(hasJa ? { ja: joined('ja', '・') } : {}) },
      generation: idFromUrl(raw.generation.url),
      order: raw.order,
      versions: members,
      regions: slugs(raw.regions),
      pokedexes: slugs(raw.pokedexes),
      machines: [...machines.values()]
        .filter(machine => machine.versionGroup === raw.name)
        .sort((a, b) => {
          const [prefixA, numberA] = machineOrder(a.item)
          const [prefixB, numberB] = machineOrder(b.item)
          return prefixA.localeCompare(prefixB) || numberA - numberB
        })
        .map(machine => ({ item: machine.item, move: machine.move })),
    }
  })

  return { versions, versionGroups }
}

export function buildPokedexes(): PokedexEntry[] {
  return readAll<RawPokedex>('pokedex').map((raw) => {
    const description: Text = {}
    for (const entry of raw.descriptions) {
      if (entry.language.name === 'en') description.en = entry.description
      else if (entry.language.name === 'ja' || entry.language.name === 'ja-Hrkt') description.ja ??= entry.description
    }
    return {
      id: raw.id,
      slug: raw.name,
      names: names(raw.names, raw.name),
      description,
      region: raw.region?.name ?? null,
      mainSeries: raw.is_main_series,
      entries: raw.pokemon_entries.map(entry => ({ id: idFromUrl(entry.pokemon_species.url), number: entry.entry_number })),
    }
  })
}

export function buildGrowthRates(): GrowthRateEntry[] {
  return readAll<RawGrowthRate>('growth-rate').map(raw => ({
    slug: raw.name,
    formula: raw.formula,
    experience: raw.levels.toSorted((a, b) => a.level - b.level).map(level => level.experience),
  }))
}

export function buildEggGroups(): EggGroupEntry[] {
  return readAll<RawEggGroup>('egg-group').map(raw => ({
    slug: raw.name,
    names: names(raw.names, raw.name),
    species: raw.pokemon_species.map(species => idFromUrl(species.url)).sort((a, b) => a - b),
  }))
}
