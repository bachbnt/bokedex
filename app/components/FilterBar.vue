<script setup lang="ts">
import type { ReferenceData } from '#shared/types/encyclopedia'

const props = defineProps<{
  types: string[]
  reference: ReferenceData | null | undefined
  resultCount: number
  favoriteCount: number
}>()

const { t } = useI18n()
const { name } = useL10n()
const labels = useLabels()

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

const regionNames = computed(() => new Map((props.reference?.regions ?? []).map(region => [region.slug, region.names])))
const generationLabel = (generation: ReferenceData['generations'][number]) => {
  const region = generation.region ? regionNames.value.get(generation.region) : undefined
  return region ? `${name(generation.names)} (${name(region)})` : name(generation.names)
}

const toggleType = (slug: string) => { type.value = type.value === slug ? '' : slug }
const hasFilters = computed(() => Boolean(query.value || type.value || gen.value || onlyFavorites.value))

function clear() {
  query.value = ''
  type.value = ''
  gen.value = 0
  onlyFavorites.value = false
}
</script>

<template>
  <section class="space-y-4" :aria-label="t('filters.region')">
    <div class="flex flex-col gap-3 sm:flex-row">
      <label class="relative block flex-1">
        <span class="sr-only">{{ t('filters.searchLabel') }}</span>
        <AppIcon name="search" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          ref="searchInput"
          v-model="query"
          type="search"
          class="input !pl-12 !pr-12"
          :placeholder="t('filters.searchPlaceholder')"
          autocomplete="off"
        >
        <kbd class="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-line px-1.5 text-xs text-muted sm:block">/</kbd>
      </label>

      <div class="flex gap-3">
        <label class="flex-1 sm:flex-none">
          <span class="sr-only">{{ t('filters.generation') }}</span>
          <select v-model.number="gen" class="input cursor-pointer">
            <option :value="0">{{ t('filters.allGenerations') }}</option>
            <option v-for="generation in reference?.generations ?? []" :key="generation.id" :value="generation.id">
              {{ generationLabel(generation) }}
            </option>
          </select>
        </label>
        <label class="flex-1 sm:flex-none">
          <span class="sr-only">{{ t('filters.sort') }}</span>
          <select v-model="sort" class="input cursor-pointer">
            <option value="id-asc">{{ t('sort.idAsc') }}</option>
            <option value="id-desc">{{ t('sort.idDesc') }}</option>
            <option value="name">{{ t('sort.name') }}</option>
          </select>
        </label>
      </div>
    </div>

    <!-- Vertical padding keeps chip lift and focus rings from being clipped by the scroller. -->
    <div class="-mx-4 -my-1.5 flex gap-2 overflow-x-auto px-4 py-1.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" :aria-label="t('filters.byType')">
      <button type="button" class="chip shrink-0" :aria-pressed="onlyFavorites" @click="onlyFavorites = !onlyFavorites">
        <AppIcon name="heart" :size="15" :filled="onlyFavorites" />
        {{ t('filters.favorites') }}
        <span class="text-xs opacity-70">{{ favoriteCount }}</span>
      </button>
      <button v-for="slug in types" :key="slug" type="button" class="chip shrink-0" :aria-pressed="type === slug" @click="toggleType(slug)">
        <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: typeColor(slug) }" />
        {{ labels.type(slug) }}
      </button>
    </div>

    <p class="flex items-center gap-3 text-sm text-muted" aria-live="polite">
      <span>{{ t('filters.found', { count: resultCount.toLocaleString() }) }}</span>
      <button v-if="hasFilters" type="button" class="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4" @click="clear">
        {{ t('filters.clear') }}
      </button>
    </p>
  </section>
</template>
