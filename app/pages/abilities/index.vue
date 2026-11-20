<script setup lang="ts">
import type { AbilityRow } from '#shared/types/encyclopedia'

const PAGE_SIZE = 100

const { t } = useI18n()
const { name, altName, locale } = useL10n()
const { data, status } = useDataset<AbilityRow[]>('abilities')
const { reference } = useReference()

useSeoMeta({ title: () => `${t('abilities.listTitle')} | Bokedex`, description: () => t('abilities.listDescription') })

const filters = useUrlState({ q: '', gen: 0, sort: 'name', desc: false })
const limit = ref(PAGE_SIZE)
watch(() => ({ ...filters }), () => { limit.value = PAGE_SIZE })

const rows = computed(() => {
  const query = normalizeSearch(filters.q)
  const matched = (data.value ?? []).filter(ability =>
    (!query || [ability.names.en, ability.names.ja, ability.names.jaKana, ability.names.jaRoma, ability.slug].some(value => value && normalizeSearch(value).includes(query)))
    && (!filters.gen || ability.generation === filters.gen),
  )
  const direction = filters.desc ? -1 : 1
  return matched.toSorted((a, b) =>
    filters.sort === 'count'
      ? direction * (a.pokemonCount - b.pokemonCount) || a.id - b.id
      : direction * name(a.names).localeCompare(name(b.names), locale.value),
  )
})
const visible = computed(() => rows.value.slice(0, limit.value))

function sortBy(column: string) {
  if (filters.sort === column) filters.desc = !filters.desc
  else { filters.sort = column; filters.desc = column === 'count' }
}
</script>

<template>
  <div class="space-y-6">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">{{ t('abilities.listTitle') }}</h1>
      <p class="text-lg text-muted">{{ t('abilities.listLead', { count: (data?.length ?? 0).toLocaleString() }) }}</p>
    </header>

    <div class="flex flex-col gap-3 sm:flex-row">
      <label class="relative block flex-1">
        <span class="sr-only">{{ t('abilities.search') }}</span>
        <AppIcon name="search" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input v-model="filters.q" type="search" class="input !pl-12" :placeholder="t('abilities.search')" autocomplete="off">
      </label>
      <label>
        <span class="sr-only">{{ t('filters.generation') }}</span>
        <select v-model.number="filters.gen" class="input cursor-pointer">
          <option :value="0">{{ t('filters.allGenerations') }}</option>
          <option v-for="generation in reference?.generations ?? []" :key="generation.id" :value="generation.id">{{ name(generation.names) }}</option>
        </select>
      </label>
    </div>
    <p class="text-sm text-muted" aria-live="polite">{{ t('abilities.found', { count: rows.length.toLocaleString() }) }}</p>

    <div v-if="status === 'pending' && !data" class="skeleton h-96" />
    <EmptyState v-else-if="!rows.length" icon="search" :title="t('abilities.emptyTitle')" :message="t('moves.emptyMessage')" />
    <div v-else class="panel overflow-x-auto p-4">
      <table class="w-full min-w-[36rem] text-left text-sm">
        <thead class="text-muted">
          <tr class="border-b border-line">
            <SortHeader :label="t('abilities.ability')" column="name" :sort="filters.sort" :descending="filters.desc" @sort="sortBy" />
            <th class="py-2 pr-3 font-medium">{{ t('abilities.effect') }}</th>
            <SortHeader :label="t('abilities.pokemon')" column="count" :sort="filters.sort" :descending="filters.desc" align="right" @sort="sortBy" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="ability in visible" :key="ability.slug" class="border-b border-line/60 align-top last:border-0">
            <td class="py-2.5 pr-3">
              <NuxtLinkLocale :to="`/abilities/${ability.slug}`" class="font-semibold underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">{{ name(ability.names) }}</NuxtLinkLocale>
              <span v-if="altName(ability.names)" class="block text-xs text-muted">{{ altName(ability.names) }}</span>
            </td>
            <td class="max-w-md py-2.5 pr-3 text-muted"><LocalizedText :value="ability.shortEffect" /></td>
            <td class="py-2.5 text-right tabular-nums">{{ ability.pokemonCount }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="rows.length > visible.length" class="pt-4 text-center">
        <button type="button" class="btn btn-ghost" @click="limit += PAGE_SIZE">{{ t('common.showMore', { count: Math.min(PAGE_SIZE, rows.length - visible.length) }) }}</button>
      </div>
    </div>
  </div>
</template>
