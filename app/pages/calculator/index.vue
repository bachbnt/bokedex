<script setup lang="ts">
import type { PokemonRow } from '#shared/types/encyclopedia'

const { t } = useI18n()
const { name, altName, locale } = useL10n()
const { refs } = useTaxonomyRefs()
const labels = useLabels(refs)
const sprites = useSprites()
const { data: table } = useDataset<PokemonRow[]>('pokemon-table')
const { reference } = useReference()

useSeoMeta({ title: () => `${t('calc.title')} | Bokedex`, description: () => t('calc.description') })

const state = useUrlState({ p: 25, level: 50, nature: 'hardy' })
const pickerOpen = ref(false)

const row = computed(() => table.value?.find(entry => entry.id === state.p))
const natures = computed(() => (reference.value?.natures ?? []).toSorted((a, b) => name(a.names).localeCompare(name(b.names), locale.value)))
const nature = computed(() => natures.value.find(entry => entry.slug === state.nature))

const ivs = reactive<Record<StatKey, number>>({ 'hp': MAX_IV, 'attack': MAX_IV, 'defense': MAX_IV, 'special-attack': MAX_IV, 'special-defense': MAX_IV, 'speed': MAX_IV })
const evs = reactive<Record<StatKey, number>>({ 'hp': 0, 'attack': 0, 'defense': 0, 'special-attack': 0, 'special-defense': 0, 'speed': 0 })

const clamp = (value: number, max: number) => Math.min(max, Math.max(0, Math.floor(Number(value) || 0)))
const evTotal = computed(() => STAT_KEYS.reduce((sum, key) => sum + evs[key], 0))
const level = computed(() => clamp(state.level, 100) || 1)

const results = computed(() => STAT_KEYS.map((stat, index) => ({
  stat,
  base: row.value?.stats[index] ?? 0,
  value: row.value
    ? calcStat({
        stat,
        base: row.value.stats[index] ?? 0,
        level: level.value,
        iv: ivs[stat],
        ev: evs[stat],
        multiplier: natureMultiplier(stat, nature.value?.increasedStat ?? null, nature.value?.decreasedStat ?? null),
        shedinja: row.value.slug === 'shedinja',
      })
    : 0,
  multiplier: natureMultiplier(stat, nature.value?.increasedStat ?? null, nature.value?.decreasedStat ?? null),
})))

function setEv(stat: StatKey, raw: number) {
  const others = evTotal.value - evs[stat]
  evs[stat] = Math.min(clamp(raw, MAX_EV), Math.max(0, MAX_TOTAL_EV - others))
}
const setAllIvs = (value: number) => STAT_KEYS.forEach((key) => { ivs[key] = value })
const resetEvs = () => STAT_KEYS.forEach((key) => { evs[key] = 0 })
</script>

<template>
  <div class="space-y-6">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">{{ t('calc.title') }}</h1>
      <p class="text-lg text-muted">{{ t('calc.lead') }}</p>
    </header>

    <section class="panel grid gap-6 p-6 lg:grid-cols-[18rem_1fr]" :style="pokemonTheme(row?.types ?? [])">
      <div class="flex flex-col items-center gap-3 text-center">
        <img v-if="row" :src="sprites.artwork(row.id)" :alt="name(row.names)" width="160" height="160" class="h-36 w-36 object-contain drop-shadow-[0_10px_8px_rgb(0_0_0/0.25)]">
        <p v-if="row" class="font-display text-2xl font-bold">{{ name(row.names) }}<span v-if="altName(row.names)" class="block text-sm font-normal text-muted">{{ altName(row.names) }}</span></p>
        <button type="button" class="btn btn-ghost" @click="pickerOpen = true">{{ t('calc.choose') }}</button>

        <label class="w-full text-left">
          <span class="mb-1 block text-sm text-muted">{{ t('calc.level') }}</span>
          <input v-model.number="state.level" type="number" min="1" max="100" class="input">
        </label>
        <label class="w-full text-left">
          <span class="mb-1 block text-sm text-muted">{{ t('natures.nature') }}</span>
          <select v-model="state.nature" class="input cursor-pointer">
            <option v-for="entry in natures" :key="entry.slug" :value="entry.slug">
              {{ name(entry.names) }}{{ entry.increasedStat ? ` (+${labels.taxonomy('stat', entry.increasedStat)} −${labels.taxonomy('stat', entry.decreasedStat)})` : '' }}
            </option>
          </select>
        </label>
        <div class="flex w-full flex-wrap gap-2">
          <button type="button" class="chip" @click="setAllIvs(MAX_IV)">{{ t('calc.perfectIvs') }}</button>
          <button type="button" class="chip" @click="setAllIvs(0)">{{ t('calc.zeroIvs') }}</button>
          <button type="button" class="chip" @click="resetEvs">{{ t('calc.resetEvs') }}</button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[28rem] text-left text-sm">
          <thead class="text-muted">
            <tr class="border-b border-line">
              <th class="py-2 pr-3 font-medium">{{ t('calc.stat') }}</th>
              <th class="py-2 pr-3 text-right font-medium">{{ t('calc.base') }}</th>
              <th class="py-2 pr-3 font-medium">IV</th>
              <th class="py-2 pr-3 font-medium">EV</th>
              <th class="py-2 text-right font-medium">{{ t('calc.result') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in results" :key="entry.stat" class="border-b border-line/60 last:border-0">
              <th scope="row" class="py-2.5 pr-3 text-left font-medium">
                {{ labels.taxonomy('stat', entry.stat) }}
                <span v-if="entry.multiplier > 1" class="text-good">▲</span><span v-else-if="entry.multiplier < 1" class="text-bad">▼</span>
              </th>
              <td class="py-2.5 pr-3 text-right tabular-nums text-muted">{{ entry.base }}</td>
              <td class="py-2.5 pr-3"><input :value="ivs[entry.stat]" type="number" min="0" :max="MAX_IV" class="input !w-20 !py-1.5" :aria-label="`IV ${labels.taxonomy('stat', entry.stat)}`" @input="ivs[entry.stat] = clamp(($event.target as HTMLInputElement).valueAsNumber, MAX_IV)"></td>
              <td class="py-2.5 pr-3"><input :value="evs[entry.stat]" type="number" min="0" :max="MAX_EV" step="4" class="input !w-24 !py-1.5" :aria-label="`EV ${labels.taxonomy('stat', entry.stat)}`" @input="setEv(entry.stat, ($event.target as HTMLInputElement).valueAsNumber)"></td>
              <td class="py-2.5 text-right font-display text-xl font-extrabold tabular-nums">{{ entry.value }}</td>
            </tr>
          </tbody>
        </table>
        <p class="mt-3 text-sm" :class="evTotal >= MAX_TOTAL_EV ? 'text-bad' : 'text-muted'">{{ t('calc.evTotal', { total: evTotal, max: MAX_TOTAL_EV }) }}</p>
      </div>
    </section>

    <PokemonPicker v-model:open="pickerOpen" :disabled-ids="[]" @select="state.p = $event" />
  </div>
</template>
