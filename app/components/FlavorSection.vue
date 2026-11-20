<script setup lang="ts">
import type { FlavorEntry } from '#shared/types/encyclopedia'

const props = defineProps<{ entries: FlavorEntry[] }>()

const labels = useLabels()
const { locale } = useL10n()

/** Newest games first; entries without text in either language are already dropped upstream. */
const ordered = computed(() => props.entries.toReversed())
</script>

<template>
  <ul class="space-y-4">
    <li v-for="entry in ordered" :key="entry.version">
      <p class="text-sm font-semibold text-muted">{{ labels.taxonomy('version', entry.version) }}</p>
      <p :lang="locale"><LocalizedText :value="entry.text" /></p>
    </li>
  </ul>
</template>
