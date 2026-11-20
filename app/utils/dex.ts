import type { DexEntry, Locale } from '#shared/types/encyclopedia'

export type SortKey = 'id-asc' | 'id-desc' | 'name'

export interface DexFilters {
  query: string
  type: string
  gen: number
  onlyFavorites: boolean
  favorites: number[]
  sort: SortKey
  locale: Locale
}

export const SORT_KEYS: SortKey[] = ['id-asc', 'id-desc', 'name']

/**
 * Matches "pika", "ピカ", "ぴか", "pikachu", "25", "#25" or "#0025" against a Pokémon.
 * Names are compared in one normal form, so hiragana, katakana and Latin spellings all work.
 */
export function matchesQuery(entry: DexEntry, rawQuery: string): boolean {
  const trimmed = rawQuery.trim().replace(/^#/, '')
  if (!trimmed) return true
  if (/^\d+$/.test(trimmed)) return entry.id === Number(trimmed) || String(entry.id).startsWith(trimmed)

  const query = normalizeSearch(trimmed)
  const { en, ja, jaKana, jaRoma } = entry.names
  return [en, ja, jaKana, jaRoma, entry.slug].some(value => value && normalizeSearch(value).includes(query))
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
  if (filters.sort === 'name') {
    const label = (entry: DexEntry) => pickName(entry.names, filters.locale)
    return result.toSorted((a, b) => label(a).localeCompare(label(b), filters.locale))
  }
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
