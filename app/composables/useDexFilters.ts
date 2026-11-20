import type { LocationQuery } from 'vue-router'

interface FilterState {
  query: string
  type: string
  gen: number
  sort: SortKey
  onlyFavorites: boolean
}

const DEFAULT_SORT: SortKey = 'id-asc'
const URL_DEBOUNCE_MS = 250

const stateKey = (state: FilterState) => JSON.stringify(state)

function readState(params: LocationQuery): FilterState {
  const text = (key: string) => (typeof params[key] === 'string' ? params[key] : '')
  const sort = text('sort') as SortKey
  return {
    query: text('q'),
    type: text('type'),
    gen: Number(text('gen')) || 0,
    sort: SORT_KEYS.includes(sort) ? sort : DEFAULT_SORT,
    onlyFavorites: text('fav') === '1',
  }
}

const toUrlQuery = (state: FilterState) => ({
  q: state.query || undefined,
  type: state.type || undefined,
  gen: state.gen || undefined,
  sort: state.sort === DEFAULT_SORT ? undefined : state.sort,
  fav: state.onlyFavorites ? '1' : undefined,
})

/**
 * Pokédex search and filters, kept in sync with the URL so a view can be shared or bookmarked.
 *
 * The URL is read through a watcher rather than once at setup: on a prerendered page Nuxt hydrates
 * with the query stripped (to match the static HTML) and applies the real query right afterwards.
 */
export function useDexFilters() {
  const route = useRoute()
  const router = useRouter()
  const collection = useCollectionStore()
  const { pokemon } = useDex()

  const query = ref('')
  const type = ref('')
  const gen = ref(0)
  const sort = ref<SortKey>(DEFAULT_SORT)
  const onlyFavorites = ref(false)

  const currentState = (): FilterState => ({
    query: query.value,
    type: type.value,
    gen: gen.value,
    sort: sort.value,
    onlyFavorites: onlyFavorites.value,
  })

  // The URL we last wrote ourselves. When it echoes back through the route it must not overwrite
  // anything the user typed in the meantime.
  let lastWritten = ''

  watch(() => route.query, (params) => {
    const incoming = readState(params)
    if (stateKey(incoming) === lastWritten) {
      lastWritten = ''
      return
    }
    query.value = incoming.query
    type.value = incoming.type
    gen.value = incoming.gen
    sort.value = incoming.sort
    onlyFavorites.value = incoming.onlyFavorites
  }, { immediate: true })

  watchDebounced([query, type, gen, sort, onlyFavorites], () => {
    const state = currentState()
    lastWritten = stateKey(state)
    router.replace({ query: toUrlQuery(state) })
  }, { debounce: URL_DEBOUNCE_MS })

  const filtered = computed(() => filterDex(pokemon.value, {
    query: query.value,
    type: type.value,
    gen: gen.value,
    onlyFavorites: onlyFavorites.value,
    favorites: collection.favorites,
    sort: sort.value,
  }))

  return { query, type, gen, sort, onlyFavorites, filtered }
}
