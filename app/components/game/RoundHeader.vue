<script setup lang="ts">
defineProps<{
  round: number
  rounds: number
  score: number
  streak: number
}>()
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between text-sm font-semibold">
      <span>Round {{ round }} of {{ rounds }}</span>
      <span class="flex items-center gap-4">
        <span v-if="streak > 1" class="animate-pop flex items-center gap-1 text-brand" :key="streak">
          <AppIcon name="bolt" :size="16" filled />
          {{ streak }} in a row
        </span>
        <span>Score {{ score }}</span>
      </span>
    </div>
    <div class="h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" :aria-valuenow="round" aria-valuemin="1" :aria-valuemax="rounds">
      <div class="h-full rounded-full bg-brand transition-[width] duration-500" :style="{ width: `${(round / rounds) * 100}%` }" />
    </div>
  </div>
</template>
