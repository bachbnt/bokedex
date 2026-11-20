<script setup lang="ts">
defineProps<{ slug: string, label: string }>()

const STYLES: Record<string, string> = {
  physical: 'bg-[#c22e28] text-white',
  special: 'bg-[#6390f0] text-white',
  status: 'bg-[#8a8fb8] text-white',
}
</script>

<template>
  <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="STYLES[slug] ?? STYLES.status">{{ label }}</span>
</template>
