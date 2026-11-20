<script setup lang="ts">
const props = defineProps<{
  score: number
  total: number
  best: number
  bestStreak: number
  newBest: boolean
}>()

defineEmits<{ replay: [] }>()

const { t } = useI18n()

const verdict = computed(() => {
  const ratio = props.score / props.total
  if (ratio === 1) return t('play.verdict.perfect')
  if (ratio >= 0.8) return t('play.verdict.great')
  if (ratio >= 0.5) return t('play.verdict.good')
  return t('play.verdict.start')
})
</script>

<template>
  <div class="animate-pop mx-auto flex max-w-md flex-col items-center gap-4 py-6 text-center">
    <PokeBall :size="88" :shake="newBest" />
    <p class="font-display text-7xl font-extrabold leading-none">{{ score }}<span class="text-3xl text-muted">/{{ total }}</span></p>
    <p class="text-lg font-semibold">{{ verdict }}</p>
    <p v-if="newBest" class="rounded-full bg-glow px-4 py-1.5 font-semibold text-[#12163a]">{{ t('play.newBest') }}</p>
    <dl class="grid w-full grid-cols-2 gap-3 text-sm">
      <div class="rounded-2xl bg-surface-2 p-3">
        <dt class="text-muted">{{ t('play.bestScore') }}</dt>
        <dd class="font-display text-2xl font-bold">{{ best }}</dd>
      </div>
      <div class="rounded-2xl bg-surface-2 p-3">
        <dt class="text-muted">{{ t('play.longestStreak') }}</dt>
        <dd class="font-display text-2xl font-bold">{{ bestStreak }}</dd>
      </div>
    </dl>
    <button type="button" class="btn btn-brand" @click="$emit('replay')">{{ t('play.again') }}</button>
  </div>
</template>
