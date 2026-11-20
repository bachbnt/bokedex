<script setup lang="ts">
const PAGE_SIZE = 48

const route = useRoute()
const router = useRouter()
const collection = useCollectionStore()
const { pokemon, generations, types, status, error, refresh, data } = useDex()

useSeoMeta({
  title: 'Bokedex: every Pokémon, one search away',
  description: 'Browse the full Pokédex, filter by type and generation, and open any Pokémon for stats, evolutions and moves.',
})

// Filter state lives in the URL so a search can be shared or bookmarked.
const queryParam = (key: string) => (typeof route.query[key] === 'string' ? (route.query[key] as string) : '')
const query = ref(queryParam('q'))
const type = ref(queryParam('type'))
const gen = ref(Number(queryParam('gen')) || 0)
const sort = ref<SortKey>(SORT_KEYS.includes(queryParam('sort') as SortKey) ? (queryParam('sort') as SortKey) : 'id-asc')
const onlyFavorites = ref(queryParam('fav') === '1')

const filtered = computed(() => filterDex(pokemon.value, {
  query: query.value,
  type: type.value,
  gen: gen.value,
  onlyFavorites: onlyFavorites.value,
  favorites: collection.favorites,
  sort: sort.value,
}))

const visibleCount = ref(PAGE_SIZE)
const visible = computed(() => filtered.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < filtered.value.length)

watchDebounced([query, type, gen, sort, onlyFavorites], () => {
  visibleCount.value = PAGE_SIZE
  router.replace({
    query: {
      q: query.value || undefined,
      type: type.value || undefined,
      gen: gen.value || undefined,
      sort: sort.value === 'id-asc' ? undefined : sort.value,
      fav: onlyFavorites.value ? '1' : undefined,
    },
  })
}, { debounce: 250 })

const sentinel = ref<HTMLElement | null>(null)
useIntersectionObserver(sentinel, ([entry]) => {
  if (entry?.isIntersecting && hasMore.value) visibleCount.value += PAGE_SIZE
}, { rootMargin: '600px' })

const today = computed(() => pickOfTheDay(pokemon.value))
</script>

<template>
  <div class="space-y-10">
    <section class="grid items-center gap-8 lg:grid-cols-[1.25fr_1fr]">
      <div class="space-y-5">
        <h1 class="max-w-xl text-5xl font-extrabold sm:text-6xl">Every Pokémon, one search away.</h1>
        <p class="max-w-lg text-lg text-muted">
          <template v-if="data">
            Browse {{ data.total.toLocaleString() }} Pokémon from {{ generations.length }} generations.
          </template>
          <template v-else>Browse every Pokémon.</template>
          Check type matchups, build a team of six, then test yourself in the quiz.
        </p>
        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/team" class="btn btn-brand">
            <AppIcon name="team" :size="18" />
            Build a team
          </NuxtLink>
          <NuxtLink to="/play" class="btn btn-ghost">
            <AppIcon name="game" :size="18" />
            Play a quiz
          </NuxtLink>
        </div>
      </div>
      <TodayPick v-if="today" :entry="today" />
      <div v-else class="skeleton h-72" />
    </section>

    <FilterBar
      v-model:query="query"
      v-model:type="type"
      v-model:gen="gen"
      v-model:sort="sort"
      v-model:only-favorites="onlyFavorites"
      :types="types"
      :generations="generations"
      :result-count="filtered.length"
      :favorite-count="collection.favorites.length"
    />

    <div v-if="status === 'pending' && !pokemon.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <div v-for="n in 10" :key="n" class="skeleton h-72" />
    </div>

    <EmptyState
      v-else-if="error"
      icon="refresh"
      title="Couldn't load the Pokédex"
      message="The data service didn't respond. Check your connection and try again."
      action="Try again"
      @action="refresh()"
    />

    <EmptyState
      v-else-if="!filtered.length"
      icon="search"
      title="No Pokémon match"
      message="Try a different name or number, or clear a filter."
    />

    <template v-else>
      <TransitionGroup tag="div" name="list" class="relative grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <PokemonCard v-for="entry in visible" :key="entry.id" :entry="entry" />
      </TransitionGroup>
      <div ref="sentinel" class="h-10" aria-hidden="true" />
      <p v-if="hasMore" class="flex items-center justify-center gap-2 text-sm text-muted">
        <PokeBall :size="20" shake />
        Loading more
      </p>
    </template>
  </div>
</template>
