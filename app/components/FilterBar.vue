<script setup lang="ts">
import type { DexGeneration } from '#shared/types/pokedex'

defineProps<{
  types: string[]
  generations: DexGeneration[]
  resultCount: number
  favoriteCount: number
}>()

const query = defineModel<string>('query', { required: true })
const type = defineModel<string>('type', { required: true })
const gen = defineModel<number>('gen', { required: true })
const sort = defineModel<SortKey>('sort', { required: true })
const onlyFavorites = defineModel<boolean>('onlyFavorites', { required: true })

const searchInput = ref<HTMLInputElement | null>(null)
onKeyStroke('/', (event) => {
  if (document.activeElement?.tagName === 'INPUT') return
  event.preventDefault()
  searchInput.value?.focus()
})

const toggleType = (name: string) => { type.value = type.value === name ? '' : name }
const hasFilters = computed(() => Boolean(query.value || type.value || gen.value || onlyFavorites.value))

function clear() {
  query.value = ''
  type.value = ''
  gen.value = 0
  onlyFavorites.value = false
}
</script>

<template>
  <section class="space-y-4" aria-label="Search and filter">
    <div class="flex flex-col gap-3 sm:flex-row">
      <label class="relative block flex-1">
        <span class="sr-only">Search by name or number</span>
        <AppIcon name="search" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          ref="searchInput"
          v-model="query"
          type="search"
          class="input !pl-12 !pr-12"
          placeholder="Search by name or number"
          autocomplete="off"
        >
        <kbd class="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-line px-1.5 text-xs text-muted sm:block">/</kbd>
      </label>

      <div class="flex gap-3">
        <label class="flex-1 sm:flex-none">
          <span class="sr-only">Generation</span>
          <select v-model.number="gen" class="input cursor-pointer">
            <option :value="0">All generations</option>
            <option v-for="generation in generations" :key="generation.id" :value="generation.id">
              {{ generation.label }}{{ generation.region ? `: ${titleCase(generation.region)}` : '' }}
            </option>
          </select>
        </label>
        <label class="flex-1 sm:flex-none">
          <span class="sr-only">Sort by</span>
          <select v-model="sort" class="input cursor-pointer">
            <option value="id-asc">Number ↑</option>
            <option value="id-desc">Number ↓</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>
    </div>

    <!-- Vertical padding keeps chip lift and focus rings from being clipped by the scroller. -->
    <div class="-mx-4 -my-1.5 flex gap-2 overflow-x-auto px-4 py-1.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label="Filter by type">
      <button
        type="button"
        class="chip shrink-0"
        :aria-pressed="onlyFavorites"
        @click="onlyFavorites = !onlyFavorites"
      >
        <AppIcon name="heart" :size="15" :filled="onlyFavorites" />
        Favorites
        <span class="text-xs opacity-70">{{ favoriteCount }}</span>
      </button>
      <button
        v-for="name in types"
        :key="name"
        type="button"
        class="chip shrink-0"
        :aria-pressed="type === name"
        @click="toggleType(name)"
      >
        <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: typeColor(name) }" />
        {{ titleCase(name) }}
      </button>
    </div>

    <p class="flex items-center gap-3 text-sm text-muted" aria-live="polite">
      <span>{{ resultCount.toLocaleString() }} Pokémon found</span>
      <button v-if="hasFilters" type="button" class="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4" @click="clear">
        Clear filters
      </button>
    </p>
  </section>
</template>
