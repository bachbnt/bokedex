<script setup lang="ts">
import type { AbilityRow, PokemonRow } from '#shared/types/encyclopedia'

const MAX_COMPARE = 4

const { t } = useI18n()
const { name, altName } = useL10n()
const { refs } = useTaxonomyRefs()
const labels = useLabels(refs)
const sprites = useSprites()
const { data } = useDataset<PokemonRow[]>('pokemon-table')
const { data: abilities } = useDataset<AbilityRow[]>('abilities')

useSeoMeta({ title: () => `${t('compare.title')} | Bokedex`, description: () => t('compare.description') })

const state = useUrlState({ ids: '' })
const ids = computed(() => state.ids.split(',').map(Number).filter(id => Number.isInteger(id) && id > 0).slice(0, MAX_COMPARE))
const setIds = (next: number[]) => { state.ids = next.join(',') }

const rowsById = computed(() => new Map((data.value ?? []).map(row => [row.id, row])))
const chosen = computed(() => ids.value.flatMap(id => (rowsById.value.get(id) ? [rowsById.value.get(id)!] : [])))
const abilityName = (slug: string) => {
  const row = abilities.value?.find(entry => entry.slug === slug)
  return row ? name(row.names) : titleCase(slug)
}

/** The best value in each row, so the winner is easy to spot. */
const best = (index: number) => Math.max(...chosen.value.map(row => (index < 6 ? (row.stats[index] ?? 0) : row.statTotal)))
const value = (row: PokemonRow, index: number) => (index < 6 ? (row.stats[index] ?? 0) : row.statTotal)
const rowKeys = [...STAT_KEYS, 'total'] as const

const pickerOpen = ref(false)
const add = (id: number) => { if (!ids.value.includes(id) && ids.value.length < MAX_COMPARE) setIds([...ids.value, id]) }
const remove = (id: number) => setIds(ids.value.filter(value => value !== id))
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div class="max-w-2xl space-y-2">
        <h1 class="text-5xl font-extrabold">{{ t('compare.title') }}</h1>
        <p class="text-lg text-muted">{{ t('compare.lead', { max: MAX_COMPARE }) }}</p>
      </div>
      <button type="button" class="btn btn-brand" :disabled="ids.length >= MAX_COMPARE" @click="pickerOpen = true">
        <AppIcon name="plus" :size="18" />
        {{ t('compare.add') }}
      </button>
    </header>

    <EmptyState v-if="!chosen.length" icon="scale" :title="t('compare.emptyTitle')" :message="t('compare.emptyMessage')" :action="t('compare.add')" @action="pickerOpen = true" />

    <div v-else class="panel overflow-x-auto p-4 sm:p-6">
      <div class="grid min-w-[36rem] gap-x-6 gap-y-3" :style="{ gridTemplateColumns: `7rem repeat(${chosen.length}, minmax(0, 1fr))` }">
        <span />
        <div v-for="row in chosen" :key="row.id" class="relative flex flex-col items-center text-center" :style="pokemonTheme(row.types)">
          <button type="button" class="absolute right-0 top-0 grid h-7 w-7 place-items-center rounded-full bg-surface-2 text-muted hover:text-brand" :aria-label="t('team.remove', { name: name(row.names) })" @click="remove(row.id)"><AppIcon name="x" :size="14" /></button>
          <img :src="sprites.artwork(row.id)" :alt="name(row.names)" width="120" height="120" class="h-28 w-28 object-contain drop-shadow-[0_10px_8px_rgb(0_0_0/0.25)]">
          <NuxtLinkLocale :to="`/pokemon/${row.id}`" class="mt-1 font-bold underline decoration-line decoration-2 underline-offset-4">{{ name(row.names) }}</NuxtLinkLocale>
          <span v-if="altName(row.names)" class="text-xs text-muted">{{ altName(row.names) }}</span>
          <span class="mt-2 flex gap-1"><TypeBadge v-for="type in row.types" :key="type" :type="type" size="sm" /></span>
        </div>

        <template v-for="(key, index) in rowKeys" :key="key">
          <span class="self-center text-sm" :class="key === 'total' ? 'font-bold' : 'text-muted'">{{ key === 'total' ? t('pokemon.statTotal') : labels.taxonomy('stat', key) }}</span>
          <div v-for="row in chosen" :key="`${key}-${row.id}`" class="flex items-center gap-2" :style="pokemonTheme(row.types)">
            <span class="w-9 text-right font-display font-bold tabular-nums" :class="value(row, index) === best(index) && chosen.length > 1 ? 'text-good' : ''">{{ value(row, index) }}</span>
            <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div class="h-full rounded-full" :style="{ width: `${Math.min(100, (value(row, index) / (index < 6 ? STAT_CAP : 800)) * 100)}%`, backgroundImage: 'linear-gradient(90deg, var(--poke), var(--poke-2))' }" />
            </div>
          </div>
        </template>

        <span class="self-start pt-1 text-sm text-muted">{{ t('pokemon.sections.abilities') }}</span>
        <ul v-for="row in chosen" :key="`ab-${row.id}`" class="space-y-1 text-sm">
          <li v-for="ability in row.abilities" :key="ability"><NuxtLinkLocale :to="`/abilities/${ability}`" class="underline decoration-line decoration-2 underline-offset-4">{{ abilityName(ability) }}</NuxtLinkLocale></li>
        </ul>

        <span class="self-start pt-1 text-sm text-muted">{{ t('pokemon.eggGroups') }}</span>
        <p v-for="row in chosen" :key="`egg-${row.id}`" class="text-sm">{{ row.eggGroups.map(group => labels.taxonomy('egg-group', group)).join(t('common.listSeparator')) || t('common.none') }}</p>
      </div>
    </div>

    <PokemonPicker v-model:open="pickerOpen" :disabled-ids="ids" @select="add" />
  </div>
</template>
