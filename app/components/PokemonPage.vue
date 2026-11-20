<script setup lang="ts">
const props = defineProps<{ formSlug: string | null }>()

const { t } = useI18n()
const route = useRoute()
const { name, altName, locale } = useL10n()
const localePath = useLocalePath()
const labels = useLabels()
const sprites = useSprites()
const collection = useCollectionStore()
const { play, playing } = useCry()

const id = computed(() => Number(route.params.id))
if (!Number.isInteger(id.value) || id.value < 1) {
  throw createError({ statusCode: 404, message: 'Not found', fatal: true })
}

const { entity: species, refs } = await useEntity('pokemon', id)

const form = computed(() => species.value.forms.find(candidate => (candidate.formSlug ?? null) === props.formSlug))
if (!form.value) throw createError({ statusCode: 404, message: 'Not found', fatal: true })

// A form without its own published name is shown as "Species (Form)".
const formLabel = computed(() => {
  const current = form.value
  if (!current || current.kind === 'default') return ''
  const own = current.formNames ?? current.names
  return own ? name(own) : titleCase(current.formSlug ?? current.slug)
})
const displayName = computed(() => (form.value?.names ? name(form.value.names) : formLabel.value ? `${name(species.value.names)} (${formLabel.value})` : name(species.value.names)))
const alternateName = computed(() => (form.value?.names ? altName(form.value.names) : altName(species.value.names)))

const shiny = ref(false)
watch(() => form.value?.pokemonId, () => { shiny.value = false })

const theme = computed(() => pokemonTheme(form.value?.types ?? []))
const artwork = computed(() => {
  const pokemonId = form.value?.pokemonId ?? id.value
  return shiny.value ? sprites.shinyArtwork(pokemonId) : sprites.artwork(pokemonId)
})

const neighbors = computed(() => ({ prev: refs.value.pokemon[id.value - 1], next: refs.value.pokemon[id.value + 1] }))

const inTeam = computed(() => collection.inTeam(id.value))
const favorite = computed(() => collection.isFavorite(id.value))
const latestFlavor = computed(() => species.value.flavor.at(-1)?.text)
const hasPast = computed(() => Boolean(form.value && (form.value.pastTypes.length || form.value.pastStats.length || form.value.pastAbilities.length)))

useSeoMeta({
  title: () => `${displayName.value} ${padDexId(id.value)} | Bokedex`,
  description: () => latestFlavor.value?.[locale.value] ?? latestFlavor.value?.en ?? t('seo.pokemonFallback', { name: displayName.value }),
  ogImage: () => sprites.artwork(form.value?.pokemonId ?? id.value),
})

onKeyStroke('ArrowLeft', () => neighbors.value.prev && navigateTo(localePath(`/pokemon/${neighbors.value.prev.id}`)))
onKeyStroke('ArrowRight', () => neighbors.value.next && navigateTo(localePath(`/pokemon/${neighbors.value.next.id}`)))
</script>

<template>
  <article v-if="form" :style="theme" class="space-y-6">
    <nav class="flex items-center justify-between gap-3" :aria-label="t('pokemon.navigation')">
      <NuxtLinkLocale to="/" class="btn btn-ghost !px-4">
        <AppIcon name="arrow-left" :size="18" />
        {{ t('nav.pokedex') }}
      </NuxtLinkLocale>
      <div class="flex gap-2">
        <NuxtLinkLocale v-if="neighbors.prev" :to="`/pokemon/${neighbors.prev.id}`" class="btn btn-ghost !px-4" :aria-label="t('pokemon.previous', { name: name(neighbors.prev.names) })">
          <AppIcon name="arrow-left" :size="18" />
          <span class="hidden sm:inline">{{ name(neighbors.prev.names) }}</span>
        </NuxtLinkLocale>
        <NuxtLinkLocale v-if="neighbors.next" :to="`/pokemon/${neighbors.next.id}`" class="btn btn-ghost !px-4" :aria-label="t('pokemon.next', { name: name(neighbors.next.names) })">
          <span class="hidden sm:inline">{{ name(neighbors.next.names) }}</span>
          <AppIcon name="arrow-right" :size="18" />
        </NuxtLinkLocale>
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
        {{ name(species.names) }}
      </span>

      <div class="relative grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div class="relative mx-auto aspect-square w-full max-w-sm">
          <img
            :key="artwork"
            :src="artwork"
            :alt="displayName"
            width="475"
            height="475"
            class="animate-float h-full w-full object-contain drop-shadow-[0_28px_24px_rgb(0_0_0/0.32)]"
            :style="{ viewTransitionName: `pkmn-${id}` }"
          >
          <button type="button" class="chip absolute bottom-0 right-0 !bg-surface/90 backdrop-blur" :aria-pressed="shiny" @click="shiny = !shiny">
            <AppIcon name="sparkle" :size="15" />
            {{ t('pokemon.shiny') }}
          </button>
        </div>

        <div class="space-y-5">
          <div>
            <p class="font-display text-xl font-bold text-muted">{{ padDexId(id) }}</p>
            <h1 class="text-5xl font-extrabold sm:text-6xl">{{ displayName }}</h1>
            <p v-if="alternateName" class="mt-1 text-xl text-muted">{{ alternateName }}</p>
            <p v-if="species.genus.en || species.genus.ja" class="mt-1 text-lg text-muted"><LocalizedText :value="species.genus" /></p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <TypeBadge v-for="type in form.types" :key="type" :type="type" link />
            <span v-if="species.isLegendary" class="rounded-full bg-glow px-3 py-1.5 text-sm font-semibold text-[#12163a]">{{ t('pokemon.legendary') }}</span>
            <span v-if="species.isMythical" class="rounded-full bg-glow px-3 py-1.5 text-sm font-semibold text-[#12163a]">{{ t('pokemon.mythical') }}</span>
            <span v-if="species.isBaby" class="rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold">{{ t('pokemon.baby') }}</span>
            <span v-if="form.battleOnly" class="rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold">{{ t('pokemon.battleOnly') }}</span>
          </div>

          <FormSwitcher :species-id="id" :forms="species.forms" :current="props.formSlug" />

          <p v-if="latestFlavor" class="max-w-prose text-lg leading-relaxed"><LocalizedText :value="latestFlavor" /></p>

          <div class="flex flex-wrap gap-3">
            <button type="button" class="btn" :disabled="playing || !form.cry" @click="play(form.cry)">
              <AppIcon name="volume" :size="18" />
              {{ t('pokemon.hearCry') }}
            </button>
            <button type="button" class="btn btn-ghost" :aria-pressed="favorite" @click="collection.toggleFavorite(id)">
              <AppIcon name="heart" :size="18" :filled="favorite" :class="favorite ? 'text-brand' : ''" />
              {{ favorite ? t('pokemon.favorited') : t('pokemon.favorite') }}
            </button>
            <button type="button" class="btn btn-ghost" :disabled="!inTeam && collection.isTeamFull" @click="collection.toggleTeam(id)">
              <AppIcon :name="inTeam ? 'check' : 'plus'" :size="18" />
              {{ inTeam ? t('pokemon.onTeam') : collection.isTeamFull ? t('pokemon.teamFull') : t('pokemon.addToTeam') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="panel space-y-5 p-6">
        <h2 class="text-2xl font-bold">{{ t('pokemon.sections.stats') }}</h2>
        <StatBars :stats="form.stats" :total="form.statTotal" />
      </section>

      <section class="panel space-y-5 p-6">
        <h2 class="text-2xl font-bold">{{ t('pokemon.sections.matchups') }}</h2>
        <TypeMatchups :types="form.types" />
      </section>

      <section class="panel p-6">
        <h2 class="mb-4 text-2xl font-bold">{{ t('pokemon.sections.profile') }}</h2>
        <PokemonProfile :species="species" :form="form" />
      </section>

      <section class="panel p-6">
        <h2 class="mb-4 text-2xl font-bold">{{ t('pokemon.sections.abilities') }}</h2>
        <AbilityList :abilities="form.abilities" />
      </section>
    </div>

    <section class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('pokemon.sections.evolution') }}</h2>
      <div class="-m-3 overflow-x-auto p-3">
        <EvolutionTree v-if="species.evolution.evolvesTo.length" :node="species.evolution" :current-id="id" class="w-max" />
        <p v-else class="text-muted">{{ t('pokemon.noEvolution', { name: name(species.names) }) }}</p>
      </div>
    </section>

    <section class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('pokemon.sections.moves') }}</h2>
      <LazyLearnsetSection :pokemon-id="form.pokemonId" hydrate-on-visible />
    </section>

    <section v-if="!form.battleOnly" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('pokemon.sections.encounters') }}</h2>
      <LazyEncounterSection :pokemon-id="form.pokemonId" hydrate-on-visible />
    </section>

    <section v-if="form.heldItems.length" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('pokemon.sections.heldItems') }}</h2>
      <HeldItems :items="form.heldItems" />
    </section>

    <section v-if="hasPast" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('pokemon.sections.past') }}</h2>
      <PastGenerations :form="form" />
    </section>

    <section v-if="species.flavor.length" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('pokemon.sections.entries') }}</h2>
      <FlavorSection :entries="species.flavor" />
    </section>

    <section class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('pokemon.sections.gallery') }}</h2>
      <SpriteGallery :pokemon-id="form.pokemonId" :has-gender-differences="species.hasGenderDifferences" />
    </section>
  </article>
</template>
