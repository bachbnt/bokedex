import type { DexEntry, DexGeneration, DexIndex, TypeInfo } from '#shared/types/pokedex'
import type { ApiList, RawGeneration, RawType } from '#shared/pokeapi/types'
import { idFromUrl, mapLimit, type PokeApi } from '#shared/pokeapi/client'

export interface DexSnapshot {
  index: DexIndex
  types: TypeInfo[]
}

interface TypeData extends TypeInfo {
  /** Dex id -> slot, for every Pokémon form that carries the type (non-default forms are filtered later). */
  members: { id: number, slot: number }[]
}

const names = (refs: { name: string }[]) => refs.map(ref => ref.name)

/**
 * One request per type. Gives us both the damage chart and which Pokémon
 * carry each type, so the grid never needs a request per Pokémon.
 */
async function loadTypeData(api: PokeApi): Promise<TypeData[]> {
  const list = await api.get<ApiList>('type?limit=200')
  const raw = await mapLimit(list.results, ref => api.get<RawType>(ref.url))

  return raw.map(({ name, damage_relations: rel, pokemon }) => ({
    name,
    relations: {
      doubleTo: names(rel.double_damage_to),
      halfTo: names(rel.half_damage_to),
      noTo: names(rel.no_damage_to),
      doubleFrom: names(rel.double_damage_from),
      halfFrom: names(rel.half_damage_from),
      noFrom: names(rel.no_damage_from),
    },
    members: pokemon.map(entry => ({ id: idFromUrl(entry.pokemon.url), slot: entry.slot })),
  }))
}

const toGenerationLabel = (name: string) => `Gen ${name.replace('generation-', '').toUpperCase()}`

async function loadGenerations(api: PokeApi) {
  const list = await api.get<ApiList>('generation?limit=100')
  const raw = await mapLimit(list.results, ref => api.get<RawGeneration>(ref.url))

  const generations: DexGeneration[] = []
  const genBySpecies = new Map<number, number>()

  raw.forEach((generation, index) => {
    const id = idFromUrl(list.results[index]!.url)
    generations.push({
      id,
      label: toGenerationLabel(generation.name),
      region: generation.main_region?.name ?? '',
    })
    for (const species of generation.pokemon_species) {
      genBySpecies.set(idFromUrl(species.url), id)
    }
  })

  generations.sort((a, b) => a.id - b.id)
  return { generations, genBySpecies }
}

/**
 * The whole dex and type chart in about 30 upstream calls, regardless of how many
 * Pokémon exist. Runs at build time to produce the static snapshot the app ships with.
 */
export async function buildDexSnapshot(api: PokeApi): Promise<DexSnapshot> {
  const [species, typeData, { generations, genBySpecies }] = await Promise.all([
    api.get<ApiList>('pokemon-species?limit=100000'),
    loadTypeData(api),
    loadGenerations(api),
  ])

  const typesById = new Map<number, { slot: number, type: string }[]>()
  for (const type of typeData) {
    for (const { id, slot } of type.members) {
      const slots = typesById.get(id) ?? []
      slots.push({ slot, type: type.name })
      typesById.set(id, slots)
    }
  }

  const pokemon: DexEntry[] = species.results
    .map((ref) => {
      const id = idFromUrl(ref.url)
      const types = (typesById.get(id) ?? []).sort((a, b) => a.slot - b.slot).map(entry => entry.type)
      return { id, name: ref.name, types, gen: genBySpecies.get(id) ?? 0 }
    })
    // Species not yet fully populated upstream have no types; hide until they do.
    .filter(entry => entry.types.length > 0)
    .sort((a, b) => a.id - b.id)

  const usedTypes = new Set(pokemon.flatMap(entry => entry.types))
  // Relations can mention types without Pokémon (e.g. stellar); drop them to keep the chart square.
  const clean = (list: string[]) => list.filter(name => usedTypes.has(name))

  const index: DexIndex = {
    total: pokemon.length,
    generations: generations.filter(generation => pokemon.some(entry => entry.gen === generation.id)),
    types: typeData.map(type => type.name).filter(name => usedTypes.has(name)),
    pokemon,
  }

  const types: TypeInfo[] = typeData
    .filter(type => usedTypes.has(type.name))
    .map(({ name, relations }) => ({
      name,
      relations: {
        doubleTo: clean(relations.doubleTo),
        halfTo: clean(relations.halfTo),
        noTo: clean(relations.noTo),
        doubleFrom: clean(relations.doubleFrom),
        halfFrom: clean(relations.halfFrom),
        noFrom: clean(relations.noFrom),
      },
    }))

  return { index, types }
}
