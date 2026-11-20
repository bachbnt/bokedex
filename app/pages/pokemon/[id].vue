<script setup lang="ts">
import { PokeApiError } from '#shared/pokeapi/client'

const route = useRoute()
const id = computed(() => Number(route.params.id))

if (!Number.isInteger(id.value) || id.value < 1) {
  throw createError({ statusCode: 404, message: 'Pokémon not found', fatal: true })
}

const sprites = useSprites()
const collection = useCollectionStore()
const { pokemon: dex } = useDex()
const { play, playing } = useCry()

const pokemonService = usePokemonService()

// Details come straight from PokeAPI in the browser; this route is client-rendered (see routeRules).
const { data: pokemon, error } = await useAsyncData(
  () => `pokemon-${id.value}`,
  async () => {
    try {
      return await pokemonService.detail(id.value)
    }
    catch (cause) {
      const notFound = cause instanceof PokeApiError && cause.status === 404
      throw createError({
        statusCode: notFound ? 404 : 502,
        message: notFound ? 'Pokémon not found' : 'Could not reach PokeAPI. Try again in a moment.',
        fatal: true,
      })
    }
  },
  { watch: [id] },
)

if (error.value || !pokemon.value) {
  throw createError({
    statusCode: error.value?.statusCode ?? 404,
    message: error.value?.message ?? 'Pokémon not found',
    fatal: true,
  })
}

// Moves are heavy (one upstream call per move), so they load after first paint.
const { data: moves, status: movesStatus, error: movesError, refresh: refreshMoves } = useLazyAsyncData(
  () => `moves-${id.value}`,
  () => pokemonService.moves(id.value),
  { server: false, watch: [id] },
)

const shiny = ref(false)
watch(id, () => { shiny.value = false })

const theme = computed(() => pokemonTheme(pokemon.value?.types ?? []))
const artwork = computed(() => (shiny.value ? sprites.shinyArtwork(id.value) : sprites.artwork(id.value)))
const displayName = computed(() => titleCase(pokemon.value?.name ?? ''))

const neighbors = computed(() => {
  const index = dex.value.findIndex(entry => entry.id === id.value)
  return {
    prev: index > 0 ? dex.value[index - 1] : undefined,
    next: index >= 0 ? dex.value[index + 1] : undefined,
  }
})

const femalePercent = computed(() => {
  const eighths = pokemon.value?.genderFemaleEighths
  return eighths == null ? null : (eighths / 8) * 100
})

const facts = computed(() => {
  const p = pokemon.value!
  return [
    { label: 'Height', value: `${p.heightM} m` },
    { label: 'Weight', value: `${p.weightKg} kg` },
    { label: 'Base experience', value: p.baseExperience ?? 'Unknown' },
    { label: 'Catch rate', value: p.captureRate ?? 'Unknown' },
    { label: 'Base friendship', value: p.baseHappiness ?? 'Unknown' },
    { label: 'Growth rate', value: p.growthRate ? titleCase(p.growthRate) : 'Unknown' },
    { label: 'Egg groups', value: p.eggGroups.map(titleCase).join(', ') || 'None' },
    { label: 'Habitat', value: p.habitat ? titleCase(p.habitat) : 'Unknown' },
  ]
})

const inTeam = computed(() => collection.inTeam(id.value))
const favorite = computed(() => collection.isFavorite(id.value))

useSeoMeta({
  title: () => `${displayName.value} ${padDexId(id.value)} | Bokedex`,
  description: () => pokemon.value?.flavor[0]?.text ?? `Stats, evolutions and moves for ${displayName.value}.`,
  ogImage: () => sprites.artwork(id.value),
})

onKeyStroke('ArrowLeft', () => neighbors.value.prev && navigateTo(`/pokemon/${neighbors.value.prev.id}`))
onKeyStroke('ArrowRight', () => neighbors.value.next && navigateTo(`/pokemon/${neighbors.value.next.id}`))
</script>

<template>
  <article v-if="pokemon" :style="theme" class="space-y-6">
    <nav class="flex items-center justify-between gap-3" aria-label="Pokémon navigation">
      <NuxtLink to="/" class="btn btn-ghost !px-4">
        <AppIcon name="arrow-left" :size="18" />
        Pokédex
      </NuxtLink>
      <div class="flex gap-2">
        <NuxtLink
          v-if="neighbors.prev"
          :to="`/pokemon/${neighbors.prev.id}`"
          class="btn btn-ghost !px-4"
          :aria-label="`Previous: ${titleCase(neighbors.prev.name)}`"
        >
          <AppIcon name="arrow-left" :size="18" />
          <span class="hidden sm:inline">{{ titleCase(neighbors.prev.name) }}</span>
        </NuxtLink>
        <NuxtLink
          v-if="neighbors.next"
          :to="`/pokemon/${neighbors.next.id}`"
          class="btn btn-ghost !px-4"
          :aria-label="`Next: ${titleCase(neighbors.next.name)}`"
        >
          <span class="hidden sm:inline">{{ titleCase(neighbors.next.name) }}</span>
          <AppIcon name="arrow-right" :size="18" />
        </NuxtLink>
      </div>
    </nav>

    <!-- Hero -->
    <section
      class="relative overflow-hidden rounded-[36px] border border-line p-6 shadow-card sm:p-10"
      :style="{
        backgroundColor: 'var(--surface)',
        backgroundImage: 'radial-gradient(70% 90% at 25% 30%, color-mix(in oklab, var(--poke) 42%, transparent), transparent 70%), linear-gradient(210deg, color-mix(in oklab, var(--poke-2) 26%, transparent), transparent 55%)',
      }"
    >
      <span
        class="font-display pointer-events-none absolute -bottom-6 left-4 select-none whitespace-nowrap text-[clamp(5rem,18vw,13rem)] font-extrabold leading-none"
        :style="{ color: 'color-mix(in oklab, var(--poke) 9%, transparent)' }"
        aria-hidden="true"
      >
        {{ displayName }}
      </span>

      <div class="relative grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div class="relative mx-auto aspect-square w-full max-w-sm">
          <img
            :key="artwork"
            :src="artwork"
            :alt="`${displayName} artwork${shiny ? ' (shiny)' : ''}`"
            width="475"
            height="475"
            class="animate-float h-full w-full object-contain drop-shadow-[0_28px_24px_rgb(0_0_0/0.32)]"
            :style="{ viewTransitionName: `pkmn-${id}` }"
          >
          <button
            type="button"
            class="chip absolute bottom-0 right-0 !bg-surface/90 backdrop-blur"
            :aria-pressed="shiny"
            @click="shiny = !shiny"
          >
            <AppIcon name="sparkle" :size="15" />
            Shiny
          </button>
        </div>

        <div class="space-y-5">
          <div>
            <p class="font-display text-xl font-bold text-muted">{{ padDexId(id) }}</p>
            <h1 class="text-5xl font-extrabold sm:text-6xl">{{ displayName }}</h1>
            <p v-if="pokemon.genus" class="mt-1 text-lg text-muted">{{ pokemon.genus }}</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <TypeBadge v-for="type in pokemon.types" :key="type" :type="type" />
            <span v-if="pokemon.isLegendary" class="rounded-full bg-glow px-3 py-1.5 text-sm font-semibold text-[#12163a]">Legendary</span>
            <span v-if="pokemon.isMythical" class="rounded-full bg-glow px-3 py-1.5 text-sm font-semibold text-[#12163a]">Mythical</span>
            <span v-if="pokemon.isBaby" class="rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold">Baby</span>
          </div>

          <p v-if="pokemon.flavor[0]" class="max-w-prose text-lg leading-relaxed">{{ pokemon.flavor[0].text }}</p>

          <div class="flex flex-wrap gap-3">
            <button type="button" class="btn" :disabled="playing" @click="play(pokemon.cry)">
              <AppIcon name="volume" :size="18" />
              Hear its cry
            </button>
            <button type="button" class="btn btn-ghost" :aria-pressed="favorite" @click="collection.toggleFavorite(id)">
              <AppIcon name="heart" :size="18" :filled="favorite" :class="favorite ? 'text-brand' : ''" />
              {{ favorite ? 'Favorited' : 'Favorite' }}
            </button>
            <button
              type="button"
              class="btn btn-ghost"
              :disabled="!inTeam && collection.isTeamFull"
              @click="collection.toggleTeam(id)"
            >
              <AppIcon :name="inTeam ? 'check' : 'plus'" :size="18" />
              {{ inTeam ? 'On your team' : collection.isTeamFull ? 'Team is full' : 'Add to team' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="panel space-y-5 p-6">
        <h2 class="text-2xl font-bold">Base stats</h2>
        <StatBars :stats="pokemon.stats" :total="pokemon.statTotal" />
      </section>

      <section class="panel space-y-5 p-6">
        <h2 class="text-2xl font-bold">Type matchups</h2>
        <TypeMatchups :types="pokemon.types" />
      </section>

      <section class="panel p-6">
        <h2 class="mb-4 text-2xl font-bold">Profile</h2>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-4">
          <div v-for="fact in facts" :key="fact.label">
            <dt class="text-sm text-muted">{{ fact.label }}</dt>
            <dd class="font-semibold">{{ fact.value }}</dd>
          </div>
        </dl>

        <div v-if="femalePercent !== null" class="mt-5">
          <p class="mb-1.5 text-sm text-muted">Gender ratio</p>
          <div class="flex h-3 overflow-hidden rounded-full" role="img" :aria-label="`${100 - femalePercent}% male, ${femalePercent}% female`">
            <div class="bg-[#6390f0]" :style="{ width: `${100 - femalePercent}%` }" />
            <div class="bg-[#f95587]" :style="{ width: `${femalePercent}%` }" />
          </div>
          <p class="mt-1.5 flex justify-between text-sm">
            <span>{{ 100 - femalePercent }}% male</span>
            <span>{{ femalePercent }}% female</span>
          </p>
        </div>
        <p v-else class="mt-5 text-sm text-muted">Genderless</p>
      </section>

      <section class="panel p-6">
        <h2 class="mb-4 text-2xl font-bold">Abilities</h2>
        <ul class="space-y-4">
          <li v-for="ability in pokemon.abilities" :key="ability.name">
            <p class="font-semibold">
              {{ titleCase(ability.name) }}
              <span v-if="ability.hidden" class="ml-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">Hidden</span>
            </p>
            <p v-if="ability.effect" class="text-sm text-muted">{{ ability.effect }}</p>
          </li>
        </ul>
      </section>
    </div>

    <section class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">Evolution</h2>
      <!-- Padding gives hovered cards room to lift: overflow-x forces overflow-y to clip too. -->
      <div class="-m-3 overflow-x-auto p-3">
        <EvolutionTree v-if="pokemon.evolution.evolvesTo.length" :node="pokemon.evolution" :current-id="id" class="w-max" />
        <p v-else class="text-muted">{{ displayName }} doesn't evolve.</p>
      </div>
    </section>

    <section class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">Moves</h2>
      <MoveTable
        :moves="moves"
        :loading="movesStatus === 'pending' || movesStatus === 'idle'"
        :failed="Boolean(movesError)"
        @retry="refreshMoves()"
      />
    </section>

    <section v-if="pokemon.flavor.length > 1" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">Pokédex entries</h2>
      <ul class="space-y-4">
        <li v-for="entry in pokemon.flavor.slice(1)" :key="entry.version">
          <p class="text-sm font-semibold text-muted">Pokémon {{ titleCase(entry.version) }}</p>
          <p>{{ entry.text }}</p>
        </li>
      </ul>
    </section>
  </article>
</template>
