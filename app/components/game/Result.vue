<script setup lang="ts">
const props = defineProps<{
  score: number
  total: number
  best: number
  bestStreak: number
  newBest: boolean
}>()

defineEmits<{ replay: [] }>()

const verdict = computed(() => {
  const ratio = props.score / props.total
  if (ratio === 1) return 'Flawless. You are a Pokémon Master.'
  if (ratio >= 0.8) return 'Elite Trainer material.'
  if (ratio >= 0.5) return 'Solid run. Keep training.'
  return 'Every champion started somewhere.'
})
</script>

<template>
  <div class="animate-pop mx-auto flex max-w-md flex-col items-center gap-4 py-6 text-center">
    <PokeBall :size="88" :shake="newBest" />
    <p class="font-display text-7xl font-extrabold leading-none">{{ score }}<span class="text-3xl text-muted">/{{ total }}</span></p>
    <p class="text-lg font-semibold">{{ verdict }}</p>
    <p v-if="newBest" class="rounded-full bg-glow px-4 py-1.5 font-semibold text-[#12163a]">New personal best</p>
    <dl class="grid w-full grid-cols-2 gap-3 text-sm">
      <div class="rounded-2xl bg-surface-2 p-3">
        <dt class="text-muted">Best score</dt>
        <dd class="font-display text-2xl font-bold">{{ best }}</dd>
      </div>
      <div class="rounded-2xl bg-surface-2 p-3">
        <dt class="text-muted">Longest streak</dt>
        <dd class="font-display text-2xl font-bold">{{ bestStreak }}</dd>
      </div>
    </dl>
    <button type="button" class="btn btn-brand" @click="$emit('replay')">Play again</button>
  </div>
</template>
