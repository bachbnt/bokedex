<script setup lang="ts">
import type { ItemRow } from '#shared/types/encyclopedia'

const PAGE_SIZE = 100

const { t } = useI18n()
const { name, altName, locale } = useL10n()
const labels = useLabels()
const sprites = useSprites()
const { data, status } = useDataset<ItemRow[]>('items')
const taxonomy = useTaxonomyRefs()

useSeoMeta({ title: () => `${t('items.listTitle')} | Bokedex`, description: () => t('items.listDescription') })

const filters = useUrlState({ q: '', pocket: '', category: '', sort: 'name', desc: false })
const limit = ref(PAGE_SIZE)
watch(() => ({ ...filters }), () => { limit.value = PAGE_SIZE })

const pockets = computed(() => Object.keys(taxonomy.value?.['item-pocket'] ?? {}))
/** Categories that actually exist inside the chosen pocket. */
const categories = computed(() => [...new Set((data.value ?? []).filter(item => !filters.pocket || item.pocket === filters.pocket).map(item => item.category))]
  .sort((a, b) => labels.taxonomy('item-category', a).localeCompare(labels.taxonomy('item-category', b), locale.value)))
watch(() => filters.pocket, () => { if (filters.category && !categories.value.includes(filters.category)) filters.category = '' })

const rows = computed(() => {
  const query = normalizeSearch(filters.q)
  const matched = (data.value ?? []).filter(item =>
    (!query || [item.names.en, item.names.ja, item.names.jaKana, item.names.jaRoma, item.slug].some(value => value && normalizeSearch(value).includes(query)))
    && (!filters.pocket || item.pocket === filters.pocket)
    && (!filters.category || item.category === filters.category),
  )
  const direction = filters.desc ? -1 : 1
  return matched.toSorted((a, b) => filters.sort === 'cost'
    ? direction * (a.cost - b.cost) || a.id - b.id
    : direction * name(a.names).localeCompare(name(b.names), locale.value))
})
const visible = computed(() => rows.value.slice(0, limit.value))

function sortBy(column: string) {
  if (filters.sort === column) filters.desc = !filters.desc
  else { filters.sort = column; filters.desc = false }
}
const clear = () => Object.assign(filters, { q: '', pocket: '', category: '' })
</script>

<template>
  <div class="space-y-6">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">{{ t('items.listTitle') }}</h1>
      <p class="text-lg text-muted">{{ t('items.listLead', { count: (data?.length ?? 0).toLocaleString() }) }}</p>
      <NuxtLinkLocale to="/berries" class="inline-flex items-center gap-2 font-semibold underline decoration-brand decoration-2 underline-offset-4">
        {{ t('items.berriesLink') }}
        <AppIcon name="arrow-right" :size="16" />
      </NuxtLinkLocale>
    </header>

    <section class="space-y-3" :aria-label="t('filters.region')">
      <div class="flex flex-col gap-3 sm:flex-row">
        <label class="relative block flex-1">
          <span class="sr-only">{{ t('items.search') }}</span>
          <AppIcon name="search" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input v-model="filters.q" type="search" class="input !pl-12" :placeholder="t('items.search')" autocomplete="off">
        </label>
        <label>
          <span class="sr-only">{{ t('items.category') }}</span>
          <select v-model="filters.category" class="input cursor-pointer">
            <option value="">{{ t('items.allCategories') }}</option>
            <option v-for="category in categories" :key="category" :value="category">{{ labels.taxonomy('item-category', category) }}</option>
          </select>
        </label>
      </div>
      <div class="-mx-4 -my-1.5 flex gap-2 overflow-x-auto px-4 py-1.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" :aria-label="t('items.pocket')">
        <button v-for="pocket in pockets" :key="pocket" type="button" class="chip shrink-0" :aria-pressed="filters.pocket === pocket" @click="filters.pocket = filters.pocket === pocket ? '' : pocket">
          {{ labels.taxonomy('item-pocket', pocket) }}
        </button>
      </div>
      <p class="flex items-center gap-3 text-sm text-muted" aria-live="polite">
        <span>{{ t('items.found', { count: rows.length.toLocaleString() }) }}</span>
        <button v-if="filters.q || filters.pocket || filters.category" type="button" class="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4" @click="clear">{{ t('filters.clear') }}</button>
      </p>
    </section>

    <div v-if="status === 'pending' && !data" class="skeleton h-96" />
    <EmptyState v-else-if="!rows.length" icon="search" :title="t('items.emptyTitle')" :message="t('moves.emptyMessage')" />
    <div v-else class="panel overflow-x-auto p-4">
      <table class="w-full min-w-[40rem] text-left text-sm">
        <thead class="text-muted">
          <tr class="border-b border-line">
            <SortHeader :label="t('items.item')" column="name" :sort="filters.sort" :descending="filters.desc" @sort="sortBy" />
            <th class="py-2 pr-3 font-medium">{{ t('items.category') }}</th>
            <th class="py-2 pr-3 font-medium">{{ t('abilities.effect') }}</th>
            <SortHeader :label="t('items.cost')" column="cost" :sort="filters.sort" :descending="filters.desc" align="right" @sort="sortBy" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in visible" :key="item.slug" class="border-b border-line/60 align-top last:border-0">
            <td class="py-2.5 pr-3">
              <NuxtLinkLocale :to="`/items/${item.slug}`" class="flex items-center gap-3">
                <img :src="sprites.item(item.slug)" alt="" width="32" height="32" loading="lazy" class="h-8 w-8 shrink-0 [image-rendering:pixelated]">
                <span>
                  <span class="block font-semibold underline decoration-line decoration-2 underline-offset-4">{{ name(item.names) }}</span>
                  <span v-if="altName(item.names)" class="block text-xs text-muted">{{ altName(item.names) }}</span>
                </span>
              </NuxtLinkLocale>
            </td>
            <td class="py-2.5 pr-3 text-muted">{{ labels.taxonomy('item-category', item.category) }}</td>
            <td class="max-w-md py-2.5 pr-3 text-muted"><LocalizedText :value="item.shortEffect" /></td>
            <td class="py-2.5 text-right tabular-nums">{{ item.cost ? item.cost.toLocaleString() : '–' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="rows.length > visible.length" class="pt-4 text-center">
        <button type="button" class="btn btn-ghost" @click="limit += PAGE_SIZE">{{ t('common.showMore', { count: Math.min(PAGE_SIZE, rows.length - visible.length) }) }}</button>
      </div>
    </div>
  </div>
</template>
