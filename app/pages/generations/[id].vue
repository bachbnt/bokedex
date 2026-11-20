<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const labels = useLabels()
const { entity: generation } = await useEntity('generations', () => String(route.params.id))

useSeoMeta({ title: () => `${t('pokemon.generationN', { n: generation.value.id })} | Bokedex`, description: () => t('generations.seoFallback', { n: generation.value.id }) })
</script>

<template>
  <article class="space-y-6">
    <NuxtLinkLocale to="/generations" class="btn btn-ghost w-fit !px-4">
      <AppIcon name="arrow-left" :size="18" />
      {{ t('generations.title') }}
    </NuxtLinkLocale>
    <EntityHeader :names="generation.names" :kicker="t('generations.kicker')">
      <NuxtLinkLocale v-if="generation.region" :to="`/regions/${generation.region}`" class="chip">{{ labels.taxonomy('region', generation.region) }}</NuxtLinkLocale>
      <NuxtLinkLocale v-for="group in generation.versionGroups" :key="group" :to="`/games/${group}`" class="chip">{{ labels.taxonomy('version-group', group) }}</NuxtLinkLocale>
    </EntityHeader>

    <section class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('generations.pokemon', { count: generation.species.length }) }}</h2>
      <PokemonGrid :ids="generation.species" />
    </section>

    <section v-if="generation.types.length" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('generations.types') }}</h2>
      <div class="flex flex-wrap gap-2"><TypeBadge v-for="type in generation.types" :key="type" :type="type" link /></div>
    </section>

    <section v-if="generation.abilities.length" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('generations.abilities', { count: generation.abilities.length }) }}</h2>
      <ul class="flex flex-wrap gap-2"><li v-for="ability in generation.abilities" :key="ability"><NuxtLinkLocale :to="`/abilities/${ability}`" class="chip">{{ labels.ability(ability) }}</NuxtLinkLocale></li></ul>
    </section>

    <section v-if="generation.moves.length" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('generations.moves', { count: generation.moves.length }) }}</h2>
      <ul class="flex flex-wrap gap-2"><li v-for="move in generation.moves" :key="move"><NuxtLinkLocale :to="`/moves/${move}`" class="chip">{{ labels.move(move) }}</NuxtLinkLocale></li></ul>
    </section>
  </article>
</template>
