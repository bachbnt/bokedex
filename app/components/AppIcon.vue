<script setup lang="ts">
/** Minimal inline icon set — keeps the bundle free of an icon dependency. */
const props = withDefaults(defineProps<{
  name: string
  size?: number
  filled?: boolean
}>(), { size: 20, filled: false })

const PATHS: Record<string, string> = {
  'search': '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  'heart': '<path d="M12 20s-7-4.4-9-9.2C1.6 7.3 4 4 7.2 4c1.9 0 3.5 1 4.8 2.7C13.3 5 14.9 4 16.8 4 20 4 22.4 7.3 21 10.8 19 15.6 12 20 12 20z"/>',
  'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  'moon': '<path d="M21 13.5A8.5 8.5 0 1 1 10.5 3 6.5 6.5 0 0 0 21 13.5z"/>',
  'team': '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.5c2.5.2 4.2 1.8 4.7 4.5"/>',
  'x': '<path d="M6 6l12 12M18 6 6 18"/>',
  'game': '<rect x="2.5" y="7" width="19" height="10" rx="5"/><path d="M7.5 10v4M5.5 12h4M16 11.2v.01M18 13v.01"/>',
  'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'volume': '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
  'sparkle': '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/>',
  'plus': '<path d="M12 5v14M5 12h14"/>',
  'check': '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  'shield': '<path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3z"/>',
  'refresh': '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  'dex': '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
  'trophy': '<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H4.5c0 3 1.5 4.5 3.5 4.5M16 6h3.5c0 3-1.5 4.5-3.5 4.5M12 13v4M8.5 20h7M10 17h4"/>',
  'bolt': '<path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2z"/>',
}

const markup = computed(() => PATHS[props.name] ?? '')
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :fill="filled ? 'currentColor' : 'none'"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="markup"
  />
</template>
