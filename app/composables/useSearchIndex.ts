import type { Names, SearchRow } from '#shared/types/encyclopedia'

export const SEARCH_KINDS = ['pokemon', 'move', 'ability', 'item', 'location', 'nature', 'type'] as const
export type SearchKind = (typeof SEARCH_KINDS)[number]

/** Where each kind of result lives. `{s}` is the row's slug (or id, or `id/form` for alternate forms). */
export const SEARCH_ROUTES: Record<SearchKind, string> = {
  pokemon: '/pokemon/',
  move: '/moves/',
  ability: '/abilities/',
  item: '/items/',
  location: '/locations/',
  nature: '/natures?nature=',
  type: '/types/',
}

export interface SearchHit {
  row: SearchRow
  score: number
}

interface Indexed {
  row: SearchRow
  keys: string[]
}

const keysOf = (names: Names, slug: string) =>
  [names.en, names.ja, names.jaKana, names.jaRoma, slug]
    .filter((value): value is string => Boolean(value))
    .map(normalizeSearch)

/** Rank: exact name, then prefix, then substring. Lower is better; null is no match. */
function scoreOf(keys: string[], query: string): number | null {
  let best: number | null = null
  for (const key of keys) {
    const score = key === query ? 0 : key.startsWith(query) ? 1 : key.includes(query) ? 2 : null
    if (score !== null && (best === null || score < best)) best = score
  }
  return best
}

/**
 * The global search index: one compact file, loaded the first time the search opens.
 * Matching ignores case, spacing and script (hiragana, katakana and Latin all work).
 */
export function useSearchIndex() {
  const rows = useState<SearchRow[] | null>('search:rows', () => null)
  const indexed = shallowRef<Indexed[]>([])
  const loading = ref(false)

  async function load() {
    if (rows.value || loading.value) return
    loading.value = true
    try {
      rows.value = await $fetch<SearchRow[]>('/data/search.json')
    }
    finally {
      loading.value = false
    }
  }

  watch(rows, (value) => {
    indexed.value = (value ?? []).map(row => ({ row, keys: keysOf(row.names, row.s.split('/').at(-1) ?? row.s) }))
  }, { immediate: true })

  function search(rawQuery: string, kind: SearchKind | null, limit: number): SearchHit[] {
    const trimmed = rawQuery.trim().replace(/^#/, '')
    if (!trimmed) return []
    const query = normalizeSearch(trimmed)
    const numeric = /^\d+$/.test(trimmed)
    const hits: SearchHit[] = []

    for (const { row, keys } of indexed.value) {
      if (kind && row.k !== kind) continue
      const byNumber = numeric && row.k === 'pokemon' && row.s.split('/')[0] === String(Number(trimmed))
      const score = byNumber ? 0 : numeric ? null : scoreOf(keys, query)
      if (score !== null) hits.push({ row, score })
    }

    return hits
      .sort((a, b) => a.score - b.score || SEARCH_KINDS.indexOf(a.row.k as SearchKind) - SEARCH_KINDS.indexOf(b.row.k as SearchKind) || a.row.names.en.length - b.row.names.en.length)
      .slice(0, limit)
  }

  return { load, search, loading, ready: computed(() => Boolean(rows.value)) }
}
