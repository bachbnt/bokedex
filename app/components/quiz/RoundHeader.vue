<script setup lang="ts">
defineProps<{
  round: number
  rounds: number
  score: number
  streak: number
}>()

const { t } = useI18n()
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between text-sm font-semibold">
      <span>{{ t('play.round', { round, rounds }) }}</span>
      <span class="flex items-center gap-4">
        <span v-if="streak > 1" :key="streak" class="animate-pop flex items-center gap-1 text-brand">
          <AppIcon name="bolt" :size="16" filled />
          {{ t('play.streak', { count: streak }) }}
        </span>
        <span>{{ t('play.score', { score }) }}</span>
      </span>
    </div>
    <div class="h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" :aria-valuenow="round" aria-valuemin="1" :aria-valuemax="rounds">
      <div class="h-full rounded-full bg-brand transition-[width] duration-500" :style="{ width: `${(round / rounds) * 100}%` }" />
    </div>
  </div>
</template>
