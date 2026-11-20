import type { DexIndex } from '#shared/types/pokedex'

/**
 * The whole dex as one compact payload (id, name, types, generation).
 * Shared across every page via the fixed key, so it is fetched once.
 */
export function useDex() {
  const { data, status, error, refresh } = useFetch<DexIndex>('/api/dex.json', { key: 'dex' })

  const pokemon = computed(() => data.value?.pokemon ?? [])
  const generations = computed(() => data.value?.generations ?? [])
  const types = computed(() => data.value?.types ?? [])
  const byId = computed(() => new Map(pokemon.value.map(entry => [entry.id, entry])))

  return { data, status, error, refresh, pokemon, generations, types, byId }
}
