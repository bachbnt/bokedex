<script setup lang="ts">
import type { PokemonStat } from '#shared/types/pokedex'

defineProps<{
  stats: PokemonStat[]
  total: number
}>()

// Bars grow from zero once mounted, which is the whole animation.
const armed = ref(false)
onMounted(() => requestAnimationFrame(() => { armed.value = true }))
</script>

<template>
  <div class="space-y-3">
    <div v-for="(stat, index) in stats" :key="stat.key" class="grid grid-cols-[5.5rem_2.5rem_1fr] items-center gap-3">
      <span class="text-sm font-medium text-muted">{{ statLabel(stat.key) }}</span>
      <span class="font-display text-right text-lg font-bold tabular-nums">{{ stat.value }}</span>
      <div
        class="h-3 overflow-hidden rounded-full bg-surface-2"
        role="meter"
        :aria-label="statLabel(stat.key)"
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

    <div class="grid grid-cols-[5.5rem_2.5rem_1fr] items-center gap-3 border-t border-line pt-3">
      <span class="text-sm font-semibold">Total</span>
      <span class="font-display text-right text-lg font-extrabold tabular-nums">{{ total }}</span>
      <span class="text-sm text-muted">{{ statTotalTier(total) }}</span>
    </div>
  </div>
</template>
