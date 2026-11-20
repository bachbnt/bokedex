<script setup lang="ts">
import type { DexEntry } from '#shared/types/pokedex'

const props = defineProps<{ entry: DexEntry }>()

const sprites = useSprites()
const collection = useCollectionStore()
const { el, onMove, reset } = useTilt()

const theme = computed(() => pokemonTheme(props.entry.types))
const imageSrc = ref(sprites.artwork(props.entry.id))
watch(() => props.entry.id, (id) => { imageSrc.value = sprites.artwork(id) })

/** Brand-new Pokémon may not have artwork yet; fall back to the pixel sprite. */
function useFallbackImage() {
  imageSrc.value = sprites.pixel(props.entry.id)
}

const favorite = computed(() => collection.isFavorite(props.entry.id))
</script>

<template>
  <article
    ref="el"
    class="holo group rounded-[28px] border border-line bg-surface shadow-card"
    :style="theme"
    @pointermove="onMove"
    @pointerleave="reset"
  >
    <NuxtLink
      :to="`/pokemon/${entry.id}`"
      class="relative block overflow-hidden rounded-[28px] p-4 pb-5"
      :style="{
        backgroundImage: 'radial-gradient(120% 90% at 50% 0%, color-mix(in oklab, var(--poke) 34%, transparent), transparent 70%), linear-gradient(160deg, color-mix(in oklab, var(--poke-2) 14%, transparent), transparent 60%)',
      }"
      :aria-label="`${titleCase(entry.name)}, ${padDexId(entry.id)}`"
    >
      <span
        class="font-display pointer-events-none absolute right-3 top-1 text-[4.25rem] font-extrabold leading-none"
        :style="{ color: 'color-mix(in oklab, var(--poke) 26%, transparent)' }"
        aria-hidden="true"
      >
        {{ String(entry.id).padStart(3, '0') }}
      </span>

      <div class="relative mx-auto aspect-square w-full max-w-[220px]" style="transform: translateZ(46px)">
        <img
          :src="imageSrc"
          :alt="titleCase(entry.name)"
          width="475"
          height="475"
          loading="lazy"
          decoding="async"
          class="h-full w-full object-contain drop-shadow-[0_14px_14px_rgb(0_0_0/0.28)] transition-transform duration-500 group-hover:scale-110"
          :style="{ viewTransitionName: `pkmn-${entry.id}` }"
          @error="useFallbackImage"
        >
      </div>

      <div class="relative mt-2">
        <h3 class="truncate text-xl font-bold">{{ titleCase(entry.name) }}</h3>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <TypeBadge v-for="type in entry.types" :key="type" :type="type" size="sm" />
        </div>
      </div>
    </NuxtLink>

    <button
      type="button"
      class="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-surface/80 backdrop-blur transition-all hover:scale-110"
      :class="favorite ? 'text-brand' : 'text-muted hover:text-brand'"
      :aria-pressed="favorite"
      :aria-label="favorite ? `Remove ${titleCase(entry.name)} from favorites` : `Add ${titleCase(entry.name)} to favorites`"
      @click.stop="collection.toggleFavorite(entry.id)"
    >
      <AppIcon name="heart" :filled="favorite" :size="19" />
    </button>
  </article>
</template>
