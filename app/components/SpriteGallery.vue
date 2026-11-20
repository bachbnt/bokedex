<script setup lang="ts">
const props = defineProps<{ pokemonId: number, hasGenderDifferences: boolean }>()

const { t } = useI18n()
const sprites = useSprites()

interface Shot { key: string, src: string, pixel?: boolean }

const shots = computed<Shot[]>(() => {
  const id = props.pokemonId
  return [
    { key: 'artwork', src: sprites.artwork(id) },
    { key: 'shinyArtwork', src: sprites.shinyArtwork(id) },
    { key: 'home', src: sprites.home(id) },
    { key: 'homeShiny', src: sprites.homeShiny(id) },
    ...(props.hasGenderDifferences ? [{ key: 'homeFemale', src: sprites.homeFemale(id) }] : []),
    { key: 'animated', src: sprites.animated(id), pixel: true },
    { key: 'pixel', src: sprites.pixel(id), pixel: true },
    { key: 'pixelBack', src: sprites.pixelBack(id), pixel: true },
    { key: 'pixelShiny', src: sprites.pixelShiny(id), pixel: true },
    { key: 'pixelShinyBack', src: sprites.pixelShinyBack(id), pixel: true },
  ]
})

// Not every Pokémon has every sprite; hide the ones that fail to load instead of showing broken images.
const failed = reactive(new Set<string>())
watch(() => props.pokemonId, () => failed.clear())
</script>

<template>
  <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
    <template v-for="shot in shots" :key="shot.key">
      <li v-if="!failed.has(shot.key)" class="flex flex-col items-center gap-2 rounded-2xl bg-surface-2 p-3">
        <img
          :src="shot.src"
          :alt="t(`pokemon.gallery.${shot.key}`)"
          loading="lazy"
          class="h-28 w-28 object-contain"
          :class="shot.pixel ? '[image-rendering:pixelated]' : ''"
          @error="failed.add(shot.key)"
        >
        <span class="text-center text-xs text-muted">{{ t(`pokemon.gallery.${shot.key}`) }}</span>
      </li>
    </template>
  </ul>
</template>
