<script setup lang="ts">
import type { Names } from '#shared/types/encyclopedia'

defineProps<{
  names: Names
  /** Small line above the title, e.g. the kind of thing this is. */
  kicker?: string
}>()

const { name, altName } = useL10n()
</script>

<template>
  <header class="panel space-y-4 p-6 sm:p-8">
    <div>
      <p v-if="kicker" class="font-display text-lg font-bold text-muted">{{ kicker }}</p>
      <h1 class="text-4xl font-extrabold sm:text-5xl">{{ name(names) }}</h1>
      <p v-if="altName(names)" class="mt-1 text-xl text-muted">{{ altName(names) }}</p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <slot />
    </div>
    <slot name="footer" />
  </header>
</template>
