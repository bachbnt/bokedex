<script setup lang="ts">
import type { MoveRow } from '#shared/types/encyclopedia'

const PAGE_SIZE = 100

const { t } = useI18n()
const { name, altName, locale } = useL10n()
const labels = useLabels()
const { data, status } = useDataset<MoveRow[]>('moves')
const { reference } = useReference()
const { types } = useTypeChart()
useTaxonomyRefs()

useSeoMeta({ title: () => `${t('moves.listTitle')} | Bokedex`, description: () => t('moves.listDescription') })

const filters = useUrlState({ q: '', type: '', cls: '', gen: 0, sort: 'name', desc: false })
const limit = ref(PAGE_SIZE)
watch(() => ({ ...filters }), () => { limit.value = PAGE_SIZE })

const CLASSES = ['physical', 'special', 'status']

const rows = computed(() => {
  const query = normalizeSearch(filters.q)
  const matched = (data.value ?? []).filter(move =>
    (!query || [move.names.en, move.names.ja, move.names.jaKana, move.names.jaRoma, move.slug].some(value => value && normalizeSearch(value).includes(query)))
    && (!filters.type || move.type === filters.type)
    && (!filters.cls || move.damageClass === filters.cls)
    && (!filters.gen || move.generation === filters.gen),
  )
  const direction = filters.desc ? -1 : 1
  const number = (value: number | null) => value ?? (filters.desc ? -1 : Number.POSITIVE_INFINITY)
  return matched.toSorted((a, b) => {
    if (filters.sort === 'name') return direction * name(a.names).localeCompare(name(b.names), locale.value)
    if (filters.sort === 'type') return direction * a.type.localeCompare(b.type) || a.id - b.id
    const key = filters.sort as 'power' | 'accuracy' | 'pp'
    return direction * (number(a[key]) - number(b[key])) || a.id - b.id
  })
})

const visible = computed(() => rows.value.slice(0, limit.value))
function sortBy(column: string) {
  if (filters.sort === column) filters.desc = !filters.desc
  else { filters.sort = column; filters.desc = false }
}
const clear = () => Object.assign(filters, { q: '', type: '', cls: '', gen: 0 })
</script>

<template>
  <div class="space-y-6">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">{{ t('moves.listTitle') }}</h1>
      <p class="text-lg text-muted">{{ t('moves.listLead', { count: (data?.length ?? 0).toLocaleString() }) }}</p>
    </header>

    <section class="space-y-3" :aria-label="t('filters.region')">
      <div class="flex flex-col gap-3 sm:flex-row">
        <label class="relative block flex-1">
          <span class="sr-only">{{ t('moves.search') }}</span>
          <AppIcon name="search" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input v-model="filters.q" type="search" class="input !pl-12" :placeholder="t('moves.search')" autocomplete="off">
        </label>
        <label>
          <span class="sr-only">{{ t('filters.generation') }}</span>
          <select v-model.number="filters.gen" class="input cursor-pointer">
            <option :value="0">{{ t('filters.allGenerations') }}</option>
            <option v-for="generation in reference?.generations ?? []" :key="generation.id" :value="generation.id">{{ name(generation.names) }}</option>
          </select>
        </label>
      </div>
      <div class="-mx-4 -my-1.5 flex gap-2 overflow-x-auto px-4 py-1.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" :aria-label="t('filters.byType')">
        <button v-for="cls in CLASSES" :key="cls" type="button" class="chip shrink-0" :aria-pressed="filters.cls === cls" @click="filters.cls = filters.cls === cls ? '' : cls">{{ labels.taxonomy('damage-class', cls) }}</button>
        <span class="mx-1 hidden w-px bg-line sm:block" aria-hidden="true" />
        <button v-for="type in types" :key="type" type="button" class="chip shrink-0" :aria-pressed="filters.type === type" @click="filters.type = filters.type === type ? '' : type">
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: typeColor(type) }" />
          {{ labels.type(type) }}
        </button>
      </div>
      <p class="flex items-center gap-3 text-sm text-muted" aria-live="polite">
        <span>{{ t('moves.found', { count: rows.length.toLocaleString() }) }}</span>
        <button v-if="filters.q || filters.type || filters.cls || filters.gen" type="button" class="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4" @click="clear">{{ t('filters.clear') }}</button>
      </p>
    </section>

    <div v-if="status === 'pending' && !data" class="skeleton h-96" />
    <EmptyState v-else-if="!rows.length" icon="search" :title="t('moves.emptyTitle')" :message="t('moves.emptyMessage')" />
    <div v-else class="panel overflow-x-auto p-4">
      <table class="w-full min-w-[40rem] text-left text-sm">
        <thead class="text-muted">
          <tr class="border-b border-line">
            <SortHeader :label="t('moves.move')" column="name" :sort="filters.sort" :descending="filters.desc" @sort="sortBy" />
            <SortHeader :label="t('moves.type')" column="type" :sort="filters.sort" :descending="filters.desc" @sort="sortBy" />
            <th class="py-2 pr-3 font-medium">{{ t('moves.class') }}</th>
            <SortHeader :label="t('moves.power')" column="power" :sort="filters.sort" :descending="filters.desc" align="right" @sort="sortBy" />
            <SortHeader :label="t('moves.accuracy')" column="accuracy" :sort="filters.sort" :descending="filters.desc" align="right" @sort="sortBy" />
            <SortHeader label="PP" column="pp" :sort="filters.sort" :descending="filters.desc" align="right" @sort="sortBy" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="move in visible" :key="move.slug" class="border-b border-line/60 last:border-0">
            <td class="py-2.5 pr-3">
              <NuxtLinkLocale :to="`/moves/${move.slug}`" class="font-semibold underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">{{ name(move.names) }}</NuxtLinkLocale>
              <span v-if="altName(move.names)" class="ml-2 text-xs text-muted">{{ altName(move.names) }}</span>
            </td>
            <td class="py-2.5 pr-3"><TypeBadge :type="move.type" size="sm" /></td>
            <td class="py-2.5 pr-3"><DamageClass :slug="move.damageClass" :label="labels.taxonomy('damage-class', move.damageClass)" /></td>
            <td class="py-2.5 pr-3 text-right tabular-nums">{{ move.power ?? '–' }}</td>
            <td class="py-2.5 pr-3 text-right tabular-nums">{{ move.accuracy ?? '–' }}</td>
            <td class="py-2.5 text-right tabular-nums">{{ move.pp ?? '–' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="rows.length > visible.length" class="pt-4 text-center">
        <button type="button" class="btn btn-ghost" @click="limit += PAGE_SIZE">{{ t('common.showMore', { count: Math.min(PAGE_SIZE, rows.length - visible.length) }) }}</button>
      </div>
    </div>
  </div>
</template>
