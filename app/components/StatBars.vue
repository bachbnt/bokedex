<script setup lang="ts">
import type { PokemonStat } from '#shared/types/encyclopedia'

defineProps<{
  stats: PokemonStat[]
  total: number
}>()

const { t } = useI18n()
const labels = useLabels()

// Bars grow from zero once mounted, which is the whole animation.
const armed = ref(false)
onMounted(() => requestAnimationFrame(() => { armed.value = true }))
</script>

<template>
  <div class="space-y-3">
    <div v-for="(stat, index) in stats" :key="stat.key" class="grid grid-cols-[6rem_2.5rem_1fr] items-center gap-3">
      <span class="text-sm font-medium text-muted">{{ labels.taxonomy('stat', stat.key) }}</span>
      <span class="font-display text-right text-lg font-bold tabular-nums">{{ stat.value }}</span>
      <div
        class="h-3 overflow-hidden rounded-full bg-surface-2"
        role="meter"
        :aria-label="labels.taxonomy('stat', stat.key)"
        :aria-valuenow="stat.value"
        aria-valuemin="0"
        :aria-valuemax="STAT_CAP"
      >
        <div
          class="h-full rounded-full transition-[width] duration-[900ms] ease-out"
          :style="{
            width: armed ? `${Math.min(100, (stat.value / STAT_CAP) * 100)}%` : '0%',
            transitionDelay: `${index * 70}ms`,
            backgroundImage: 'linear-gradient(90deg, var(--poke), var(--poke-2))',
          }"
        />
      </div>
    </div>

    <div class="grid grid-cols-[6rem_2.5rem_1fr] items-center gap-3 border-t border-line pt-3">
      <span class="text-sm font-semibold">{{ t('pokemon.statTotal') }}</span>
      <span class="font-display text-right text-lg font-extrabold tabular-nums">{{ total }}</span>
      <span class="text-sm text-muted">{{ t(`pokemon.statTier.${statTotalTier(total)}`) }}</span>
    </div>

    <p v-if="stats.some(stat => stat.effort)" class="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line pt-3 text-sm">
      <span class="font-semibold">{{ t('pokemon.evYield') }}</span>
      <span v-for="stat in stats.filter(item => item.effort)" :key="stat.key" class="rounded-full bg-surface-2 px-2.5 py-0.5">
        +{{ stat.effort }} {{ labels.taxonomy('stat', stat.key) }}
      </span>
    </p>
  </div>
</template>
