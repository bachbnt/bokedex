<script setup lang="ts">
const props = defineProps<{
  ids: number[]
  /** A short note under a Pokémon's name, keyed by species id (for example "Hidden" or "5%"). */
  notes?: Record<number, string>
}>()

const { name } = useL10n()
const sprites = useSprites()
const refs = useRefs()

const entries = computed(() => props.ids.flatMap((id) => {
  const entry = refs.value.pokemon[id]
  return entry ? [entry] : []
}))
</script>

<template>
  <ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
    <li v-for="entry in entries" :key="entry.id">
      <NuxtLinkLocale
        :to="`/pokemon/${entry.id}`"
        class="flex items-center gap-2 rounded-2xl border border-line bg-surface-2 p-2 transition-all hover:-translate-y-0.5 hover:border-muted"
      >
        <img :src="sprites.pixel(entry.id)" alt="" width="48" height="48" loading="lazy" class="h-12 w-12 shrink-0 object-contain [image-rendering:pixelated]">
        <span class="min-w-0">
          <span class="block truncate text-sm font-semibold">{{ name(entry.names) }}</span>
          <span class="flex items-center gap-1 text-xs text-muted">
            {{ padDexId(entry.id) }}
            <span v-for="type in entry.types" :key="type" class="h-2 w-2 rounded-full" :style="{ backgroundColor: typeColor(type) }" />
          </span>
          <span v-if="notes?.[entry.id]" class="mt-0.5 inline-block rounded-full bg-surface px-1.5 text-[0.65rem] text-muted">{{ notes[entry.id] }}</span>
        </span>
      </NuxtLinkLocale>
    </li>
  </ul>
</template>
