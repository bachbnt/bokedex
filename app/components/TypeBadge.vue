<script setup lang="ts">
const props = withDefaults(defineProps<{
  type: string
  size?: 'sm' | 'md'
  /** Show a multiplier (e.g. 2, 0.5) beside the name. */
  multiplier?: number
}>(), { size: 'md', multiplier: undefined })

const background = computed(() => typeColor(props.type))
const ink = computed(() => readableInk(background.value))
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full font-semibold leading-none whitespace-nowrap"
    :class="size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'"
    :style="{ backgroundColor: background, color: ink }"
  >
    {{ titleCase(type) }}
    <span v-if="multiplier !== undefined" class="rounded-full bg-black/15 px-1.5 py-0.5 text-[0.7em]">
      {{ formatMultiplier(multiplier) }}
    </span>
  </span>
</template>
