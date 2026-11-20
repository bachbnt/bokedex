<script setup lang="ts">
import type { LocationRow } from '#shared/types/encyclopedia'

const PAGE_SIZE = 100

const { t } = useI18n()
const { name, altName, locale } = useL10n()
const { data, status } = useDataset<LocationRow[]>('locations')
const { reference } = useReference()

useSeoMeta({ title: () => `${t('locations.listTitle')} | Bokedex`, description: () => t('locations.listDescription') })

const filters = useUrlState({ q: '', region: '', wild: false })
const limit = ref(PAGE_SIZE)
watch(() => ({ ...filters }), () => { limit.value = PAGE_SIZE })

const regionNames = computed(() => new Map((reference.value?.regions ?? []).map(region => [region.slug, region.names])))
const regionLabel = (slug: string | null) => (slug && regionNames.value.get(slug) ? name(regionNames.value.get(slug)!) : '–')

const rows = computed(() => {
  const query = normalizeSearch(filters.q)
  return (data.value ?? [])
    .filter(location =>
      (!query || [location.names.en, location.names.ja, location.names.jaKana, location.slug].some(value => value && normalizeSearch(value).includes(query)))
      && (!filters.region || location.region === filters.region)
      && (!filters.wild || location.encounterCount > 0),
    )
    .toSorted((a, b) => name(a.names).localeCompare(name(b.names), locale.value))
})
const visible = computed(() => rows.value.slice(0, limit.value))
</script>

<template>
  <div class="space-y-6">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">{{ t('locations.listTitle') }}</h1>
      <p class="text-lg text-muted">{{ t('locations.listLead', { count: (data?.length ?? 0).toLocaleString() }) }}</p>
    </header>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label class="relative block flex-1">
        <span class="sr-only">{{ t('locations.search') }}</span>
        <AppIcon name="search" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input v-model="filters.q" type="search" class="input !pl-12" :placeholder="t('locations.search')" autocomplete="off">
      </label>
      <label>
        <span class="sr-only">{{ t('locations.region') }}</span>
        <select v-model="filters.region" class="input cursor-pointer">
          <option value="">{{ t('locations.allRegions') }}</option>
          <option v-for="region in reference?.regions ?? []" :key="region.slug" :value="region.slug">{{ name(region.names) }}</option>
        </select>
      </label>
      <button type="button" class="chip" :aria-pressed="filters.wild" @click="filters.wild = !filters.wild">{{ t('locations.onlyWild') }}</button>
    </div>
    <p class="text-sm text-muted" aria-live="polite">{{ t('locations.found', { count: rows.length.toLocaleString() }) }}</p>

    <div v-if="status === 'pending' && !data" class="skeleton h-96" />
    <EmptyState v-else-if="!rows.length" icon="search" :title="t('locations.emptyTitle')" :message="t('moves.emptyMessage')" />
    <div v-else class="panel overflow-x-auto p-4">
      <table class="w-full min-w-[30rem] text-left text-sm">
        <thead class="text-muted">
          <tr class="border-b border-line">
            <th class="py-2 pr-3 font-medium">{{ t('locations.place') }}</th>
            <th class="py-2 pr-3 font-medium">{{ t('locations.region') }}</th>
            <th class="py-2 pr-3 text-right font-medium">{{ t('locations.areas') }}</th>
            <th class="py-2 text-right font-medium">{{ t('locations.pokemon') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="location in visible" :key="location.slug" class="border-b border-line/60 last:border-0">
            <td class="py-2.5 pr-3">
              <NuxtLinkLocale :to="`/locations/${location.slug}`" class="font-semibold underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">{{ name(location.names) }}</NuxtLinkLocale>
              <span v-if="altName(location.names)" class="ml-2 text-xs text-muted">{{ altName(location.names) }}</span>
            </td>
            <td class="py-2.5 pr-3 text-muted">{{ regionLabel(location.region) }}</td>
            <td class="py-2.5 pr-3 text-right tabular-nums">{{ location.areaCount }}</td>
            <td class="py-2.5 text-right tabular-nums">{{ location.encounterCount || '–' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="rows.length > visible.length" class="pt-4 text-center">
        <button type="button" class="btn btn-ghost" @click="limit += PAGE_SIZE">{{ t('common.showMore', { count: Math.min(PAGE_SIZE, rows.length - visible.length) }) }}</button>
      </div>
    </div>
  </div>
</template>
