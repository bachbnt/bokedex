<script setup lang="ts">
import type { DexEntry } from '#shared/types/pokedex'

const props = defineProps<{ entry: DexEntry }>()

const sprites = useSprites()
const theme = computed(() => pokemonTheme(props.entry.types))
</script>

<template>
  <NuxtLink
    :to="`/pokemon/${entry.id}`"
    class="group relative block overflow-hidden rounded-[32px] border border-line p-6 shadow-card"
    :style="{
      ...theme,
      backgroundColor: 'var(--surface)',
      backgroundImage: 'radial-gradient(90% 80% at 70% 20%, color-mix(in oklab, var(--poke) 45%, transparent), transparent 70%), linear-gradient(200deg, color-mix(in oklab, var(--poke-2) 22%, transparent), transparent 55%)',
    }"
  >
    <p class="text-sm font-semibold text-muted">Pokémon of the day</p>
    <p class="font-display mt-1 text-3xl font-extrabold">{{ titleCase(entry.name) }}</p>
    <div class="mt-2 flex gap-1.5">
      <TypeBadge v-for="type in entry.types" :key="type" :type="type" size="sm" />
    </div>

    <img
      :src="sprites.artwork(entry.id)"
      :alt="`${titleCase(entry.name)} artwork`"
      width="475"
      height="475"
      class="animate-float mx-auto mt-2 w-48 drop-shadow-[0_18px_16px_rgb(0_0_0/0.3)] transition-transform duration-500 group-hover:scale-110 sm:w-56"
    >
    <span class="font-display pointer-events-none absolute -bottom-4 -right-1 text-[7rem] font-extrabold leading-none" :style="{ color: 'color-mix(in oklab, var(--poke) 22%, transparent)' }" aria-hidden="true">
      {{ padDexId(entry.id).slice(1) }}
    </span>
  </NuxtLink>
</template>
