import type { DexEntry, DexGeneration, DexIndex, TypeInfo } from '#shared/types/pokedex'
import type { ApiList, RawGeneration, RawType } from '#server/types/pokeapi'
import { cacheOptions, idFromUrl, mapLimit, pokeFetch, pokeFetchUrl } from '#server/utils/pokeapi'

interface TypeData extends TypeInfo {
  /** Dex id -> slot, for default-form Pokémon only (filtered later). */
  members: { id: number, slot: number }[]
}

const names = (refs: { name: string }[]) => refs.map(ref => ref.name)

/**
 * One request per type. Gives us both the damage chart and which Pokémon
 * carry each type, so the grid never needs a request per Pokémon.
 */
const loadTypeData = defineCachedFunction(async (): Promise<TypeData[]> => {
  const list = await pokeFetch<ApiList>('type?limit=200')
  const raw = await mapLimit(list.results, ref => pokeFetchUrl<RawType>(ref.url))

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
}, cacheOptions('type-data'))

const toGenerationLabel = (name: string) => `Gen ${name.replace('generation-', '').toUpperCase()}`

const loadGenerations = defineCachedFunction(async () => {
  const list = await pokeFetch<ApiList>('generation?limit=100')
  const raw = await mapLimit(list.results, ref => pokeFetchUrl<RawGeneration>(ref.url))

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
  return { generations, genBySpecies: [...genBySpecies] as [number, number][] }
}, cacheOptions('generations'))

/** The full dex in ~30 upstream calls, regardless of how many Pokémon exist. */
export const getDexIndex = defineCachedFunction(async (): Promise<DexIndex> => {
  const [species, typeData, { generations, genBySpecies }] = await Promise.all([
    pokeFetch<ApiList>('pokemon-species?limit=100000'),
    loadTypeData(),
    loadGenerations(),
  ])

  const genMap = new Map(genBySpecies)
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
      return { id, name: ref.name, types, gen: genMap.get(id) ?? 0 }
    })
    // Species not yet fully populated upstream have no types; hide until they do.
    .filter(entry => entry.types.length > 0)
    .sort((a, b) => a.id - b.id)

  const usedTypes = new Set(pokemon.flatMap(entry => entry.types))

  return {
    total: pokemon.length,
    generations: generations.filter(gen => pokemon.some(entry => entry.gen === gen.id)),
    types: typeData.map(type => type.name).filter(name => usedTypes.has(name)),
    pokemon,
  }
}, cacheOptions('dex-index'))

/** Damage relations for the types that matter in-game. */
export const getTypeInfos = defineCachedFunction(async (): Promise<TypeInfo[]> => {
  const [typeData, index] = await Promise.all([loadTypeData(), getDexIndex()])
  const playable = new Set(index.types)

  // Relations can mention types without Pokémon (e.g. stellar); drop them to keep the chart square.
  const clean = (list: string[]) => list.filter(name => playable.has(name))

  return typeData
    .filter(type => playable.has(type.name))
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
}, cacheOptions('type-infos'))
