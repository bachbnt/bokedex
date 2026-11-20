import type { DexEntry } from '#shared/types/pokedex'

export type SortKey = 'id-asc' | 'id-desc' | 'name'

export interface DexFilters {
  query: string
  type: string
  gen: number
  onlyFavorites: boolean
  favorites: number[]
  sort: SortKey
}

export const SORT_KEYS: SortKey[] = ['id-asc', 'id-desc', 'name']

/** Matches "pika", "25", "#25" or "#0025". */
export function matchesQuery(entry: DexEntry, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase().replace(/^#/, '')
  if (!query) return true
  if (/^\d+$/.test(query)) return entry.id === Number(query) || String(entry.id).startsWith(query)
  return entry.name.replace(/-/g, ' ').includes(query.replace(/-/g, ' '))
}

export function filterDex(pokemon: DexEntry[], filters: DexFilters): DexEntry[] {
  const favorites = new Set(filters.favorites)

  const result = pokemon.filter(entry =>
    matchesQuery(entry, filters.query)
    && (!filters.type || entry.types.includes(filters.type))
    && (!filters.gen || entry.gen === filters.gen)
    && (!filters.onlyFavorites || favorites.has(entry.id)),
  )

  if (filters.sort === 'id-desc') return result.toSorted((a, b) => b.id - a.id)
  if (filters.sort === 'name') return result.toSorted((a, b) => a.name.localeCompare(b.name))
  return result
}

/** Deterministic "Pokémon of the day": same pick for everyone on a given UTC date (SSR-safe). */
export function pickOfTheDay(pokemon: DexEntry[], date = new Date()): DexEntry | undefined {
  if (pokemon.length === 0) return undefined
  const daySeed = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000)
  return pokemon[(daySeed * 2654435761) % pokemon.length]
}

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

export function sample<T>(items: readonly T[], count: number): T[] {
  return shuffle(items).slice(0, count)
}
