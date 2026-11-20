import type { DexEntry, ReferenceData } from '#shared/types/encyclopedia'

/**
 * The whole Pokédex as one compact list (id, names in both languages, types, generation).
 * Shared across pages via the fixed key, so it is fetched once.
 */
export function useDex() {
  const { data, status, error, refresh } = useDataset<DexEntry[]>('dex')

  const pokemon = computed(() => data.value ?? [])
  const byId = computed(() => new Map(pokemon.value.map(entry => [entry.id, entry])))

  return { data, status, error, refresh, pokemon, byId }
}

/** Generations, games, regions and other small reference collections. */
export function useReference() {
  const { data, status } = useDataset<ReferenceData>('reference')

  const generations = computed(() => data.value?.generations ?? [])
  const versionGroups = computed(() => data.value?.versionGroups ?? [])

  return { reference: data, status, generations, versionGroups }
}
