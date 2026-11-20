<script setup lang="ts">
import type { VersionGroupText } from '#shared/types/encyclopedia'

const props = defineProps<{ entries: VersionGroupText[] }>()

const labels = useLabels()
const { locale } = useL10n()

/** Newest games first. */
const ordered = computed(() => props.entries.toReversed())
</script>

<template>
  <ul class="space-y-4">
    <li v-for="entry in ordered" :key="entry.versionGroup">
      <p class="text-sm font-semibold text-muted">{{ labels.taxonomy('version-group', entry.versionGroup) }}</p>
      <p :lang="locale"><LocalizedText :value="entry.text" /></p>
    </li>
  </ul>
</template>
