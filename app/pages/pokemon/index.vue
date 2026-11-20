<script setup lang="ts">
import type { AbilityRow, PokemonRow } from '#shared/types/encyclopedia'

const PAGE_SIZE = 60

const { t } = useI18n()
const { name, altName, locale } = useL10n()
const { refs } = useTaxonomyRefs()
const labels = useLabels(refs)
const sprites = useSprites()
const { data, status } = useDataset<PokemonRow[]>('pokemon-table')
const { data: abilities } = useDataset<AbilityRow[]>('abilities')
const { reference } = useReference()
const { types } = useTypeChart()

useSeoMeta({ title: () => `${t('advanced.title')} | Bokedex`, description: () => t('advanced.description') })

const filters = useUrlState({
  q: '', type: '', type2: '', gen: 0, egg: '', color: '', shape: '', habitat: '', ability: '', special: '',
  stat: 'total', min: 0, sort: 'id', desc: false,
})
const limit = ref(PAGE_SIZE)
watch(() => ({ ...filters }), () => { limit.value = PAGE_SIZE })

const facet = (pick: (row: PokemonRow) => string | null | string[]) =>
  [...new Set((data.value ?? []).flatMap((row) => { const value = pick(row); return Array.isArray(value) ? value : value ? [value] : [] }))]
const options = (slugs: string[], kind: Parameters<typeof labels.taxonomy>[0]) =>
  slugs.map(slug => ({ slug, label: labels.taxonomy(kind, slug) })).sort((a, b) => a.label.localeCompare(b.label, locale.value))

const eggGroups = computed(() => options(facet(row => row.eggGroups), 'egg-group'))
const colors = computed(() => options(facet(row => row.color), 'color'))
const shapes = computed(() => options(facet(row => row.shape), 'shape'))
const habitats = computed(() => options(facet(row => row.habitat), 'habitat'))
const abilityOptions = computed(() => (abilities.value ?? []).map(row => ({ slug: row.slug, label: name(row.names) })).sort((a, b) => a.label.localeCompare(b.label, locale.value)))

const COLUMNS = [...STAT_KEYS, 'total'] as const
const statValue = (row: PokemonRow, key: string) => (key === 'total' ? row.statTotal : (row.stats[STAT_KEYS.indexOf(key as StatKey)] ?? 0))

const rows = computed(() => {
  const found = (data.value ?? []).filter(row =>
    matchesQuery(row, filters.q)
    && (!filters.type || row.types.includes(filters.type))
    && (!filters.type2 || row.types.includes(filters.type2))
    && (!filters.gen || row.gen === filters.gen)
    && (!filters.egg || row.eggGroups.includes(filters.egg))
    && (!filters.color || row.color === filters.color)
    && (!filters.shape || row.shape === filters.shape)
    && (!filters.habitat || row.habitat === filters.habitat)
    && (!filters.ability || row.abilities.includes(filters.ability))
    && (!filters.special || (filters.special === 'legendary' && row.isLegendary) || (filters.special === 'mythical' && row.isMythical) || (filters.special === 'baby' && row.isBaby))
    && statValue(row, filters.stat) >= filters.min,
  )
  const direction = filters.desc ? -1 : 1
  return found.toSorted((a, b) => {
    if (filters.sort === 'id') return direction * (a.id - b.id)
    if (filters.sort === 'name') return direction * name(a.names).localeCompare(name(b.names), locale.value)
    return direction * (statValue(a, filters.sort) - statValue(b, filters.sort)) || a.id - b.id
  })
})
const visible = computed(() => rows.value.slice(0, limit.value))

function sortBy(column: string) {
  if (filters.sort === column) filters.desc = !filters.desc
  else { filters.sort = column; filters.desc = column !== 'name' && column !== 'id' }
}
const activeCount = computed(() => Object.entries(filters).filter(([key, value]) => !['stat', 'min', 'sort', 'desc'].includes(key) && value).length + (filters.min ? 1 : 0))
function reset() {
  Object.assign(filters, { q: '', type: '', type2: '', gen: 0, egg: '', color: '', shape: '', habitat: '', ability: '', special: '', stat: 'total', min: 0 })
}
const statLabel = (key: string) => (key === 'total' ? t('pokemon.statTotal') : labels.taxonomy('stat', key))
</script>

<template>
  <div class="space-y-6">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">{{ t('advanced.title') }}</h1>
      <p class="text-lg text-muted">{{ t('advanced.lead') }}</p>
    </header>

    <section class="panel grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4" :aria-label="t('filters.region')">
      <label class="relative block self-end sm:col-span-2">
        <span class="sr-only">{{ t('filters.searchLabel') }}</span>
        <AppIcon name="search" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input v-model="filters.q" type="search" class="input !pl-12" :placeholder="t('filters.searchPlaceholder')" autocomplete="off">
      </label>
      <label>
        <span class="mb-1 block text-sm text-muted">{{ t('advanced.type') }}</span>
        <select v-model="filters.type" class="input cursor-pointer"><option value="">{{ t('advanced.any') }}</option><option v-for="type in types" :key="type" :value="type">{{ labels.type(type) }}</option></select>
      </label>
      <label>
        <span class="mb-1 block text-sm text-muted">{{ t('advanced.secondType') }}</span>
        <select v-model="filters.type2" class="input cursor-pointer"><option value="">{{ t('advanced.any') }}</option><option v-for="type in types" :key="type" :value="type">{{ labels.type(type) }}</option></select>
      </label>
      <label>
        <span class="mb-1 block text-sm text-muted">{{ t('filters.generation') }}</span>
        <select v-model.number="filters.gen" class="input cursor-pointer"><option :value="0">{{ t('advanced.any') }}</option><option v-for="generation in reference?.generations ?? []" :key="generation.id" :value="generation.id">{{ name(generation.names) }}</option></select>
      </label>
      <label>
        <span class="mb-1 block text-sm text-muted">{{ t('advanced.ability') }}</span>
        <select v-model="filters.ability" class="input cursor-pointer"><option value="">{{ t('advanced.any') }}</option><option v-for="option in abilityOptions" :key="option.slug" :value="option.slug">{{ option.label }}</option></select>
      </label>
      <label>
        <span class="mb-1 block text-sm text-muted">{{ t('pokemon.eggGroups') }}</span>
        <select v-model="filters.egg" class="input cursor-pointer"><option value="">{{ t('advanced.any') }}</option><option v-for="option in eggGroups" :key="option.slug" :value="option.slug">{{ option.label }}</option></select>
      </label>
      <label>
        <span class="mb-1 block text-sm text-muted">{{ t('pokemon.color') }}</span>
        <select v-model="filters.color" class="input cursor-pointer"><option value="">{{ t('advanced.any') }}</option><option v-for="option in colors" :key="option.slug" :value="option.slug">{{ option.label }}</option></select>
      </label>
      <label>
        <span class="mb-1 block text-sm text-muted">{{ t('pokemon.shape') }}</span>
        <select v-model="filters.shape" class="input cursor-pointer"><option value="">{{ t('advanced.any') }}</option><option v-for="option in shapes" :key="option.slug" :value="option.slug">{{ option.label }}</option></select>
      </label>
      <label>
        <span class="mb-1 block text-sm text-muted">{{ t('pokemon.habitat') }}</span>
        <select v-model="filters.habitat" class="input cursor-pointer"><option value="">{{ t('advanced.any') }}</option><option v-for="option in habitats" :key="option.slug" :value="option.slug">{{ option.label }}</option></select>
      </label>
      <label>
        <span class="mb-1 block text-sm text-muted">{{ t('advanced.kind') }}</span>
        <select v-model="filters.special" class="input cursor-pointer">
          <option value="">{{ t('advanced.any') }}</option>
          <option value="legendary">{{ t('pokemon.legendary') }}</option><option value="mythical">{{ t('pokemon.mythical') }}</option><option value="baby">{{ t('pokemon.baby') }}</option>
        </select>
      </label>
      <div class="sm:col-span-2">
        <span class="mb-1 block text-sm text-muted">{{ t('advanced.minimum') }}</span>
        <div class="flex gap-2">
          <select v-model="filters.stat" class="input cursor-pointer" :aria-label="t('advanced.statChoice')"><option v-for="key in COLUMNS" :key="key" :value="key">{{ statLabel(key) }}</option></select>
          <input v-model.number="filters.min" type="number" min="0" :max="filters.stat === 'total' ? 800 : 255" step="5" class="input" :aria-label="t('advanced.minimum')">
        </div>
      </div>
    </section>

    <p class="flex items-center gap-3 text-sm text-muted" aria-live="polite">
      <span>{{ t('filters.found', { count: rows.length.toLocaleString() }) }}</span>
      <button v-if="activeCount" type="button" class="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4" @click="reset">{{ t('filters.clear') }}</button>
    </p>

    <div v-if="status === 'pending' && !data" class="skeleton h-96" />
    <EmptyState v-else-if="!rows.length" icon="search" :title="t('home.emptyTitle')" :message="t('home.emptyMessage')" />
    <div v-else class="panel overflow-x-auto p-4">
      <table class="w-full min-w-[46rem] text-left text-sm">
        <thead class="text-muted">
          <tr class="border-b border-line">
            <SortHeader :label="t('advanced.number')" column="id" :sort="filters.sort" :descending="filters.desc" @sort="sortBy" />
            <SortHeader :label="t('advanced.pokemon')" column="name" :sort="filters.sort" :descending="filters.desc" @sort="sortBy" />
            <th class="py-2 pr-3 font-medium">{{ t('moves.type') }}</th>
            <SortHeader v-for="key in COLUMNS" :key="key" :label="statLabel(key)" :column="key" :sort="filters.sort" :descending="filters.desc" align="right" @sort="sortBy" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in visible" :key="row.id" class="border-b border-line/60 last:border-0">
            <td class="py-2 pr-3 font-display font-bold tabular-nums text-muted">{{ padDexId(row.id) }}</td>
            <td class="py-2 pr-3">
              <NuxtLinkLocale :to="`/pokemon/${row.id}`" class="flex items-center gap-2">
                <img :src="sprites.pixel(row.id)" alt="" width="40" height="40" loading="lazy" class="h-10 w-10 shrink-0 [image-rendering:pixelated]">
                <span><span class="block font-semibold underline decoration-line decoration-2 underline-offset-4">{{ name(row.names) }}</span><span v-if="altName(row.names)" class="block text-xs text-muted">{{ altName(row.names) }}</span></span>
              </NuxtLinkLocale>
            </td>
            <td class="py-2 pr-3"><span class="flex gap-1"><TypeBadge v-for="type in row.types" :key="type" :type="type" size="sm" /></span></td>
            <td v-for="key in COLUMNS" :key="key" class="py-2 pr-3 text-right tabular-nums" :class="key === 'total' ? 'font-bold' : ''">{{ statValue(row, key) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="rows.length > visible.length" class="pt-4 text-center">
        <button type="button" class="btn btn-ghost" @click="limit += PAGE_SIZE">{{ t('common.showMore', { count: Math.min(PAGE_SIZE, rows.length - visible.length) }) }}</button>
      </div>
    </div>
  </div>
</template>
