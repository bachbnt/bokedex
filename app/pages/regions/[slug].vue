<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { name, altName } = useL10n()
const { entity: region, refs } = await useEntity('regions', () => String(route.params.slug))
const labels = useLabels(refs)

useSeoMeta({ title: () => `${name(region.value.names)} | Bokedex`, description: () => t('regions.seoFallback', { name: name(region.value.names) }) })
useEntitySchema('regions', {
  name: () => name(region.value.names),
  alternateName: () => altName(region.value.names),
})

const locations = computed(() => region.value.locations.flatMap(slug => (refs.value.locations[slug] ? [refs.value.locations[slug]] : []))
  .toSorted((a, b) => name(a.names).localeCompare(name(b.names))))
</script>

<template>
  <article class="space-y-6">
    <NuxtLinkLocale to="/regions" class="btn btn-ghost w-fit !px-4">
      <AppIcon name="arrow-left" :size="18" />
      {{ t('regions.title') }}
    </NuxtLinkLocale>
    <EntityHeader :names="region.names" :kicker="t('regions.kicker')">
      <NuxtLinkLocale v-if="region.mainGeneration" :to="`/generations/${region.mainGeneration}`" class="chip">{{ t('pokemon.generationN', { n: region.mainGeneration }) }}</NuxtLinkLocale>
    </EntityHeader>

    <section v-if="region.versionGroups.length" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('regions.games') }}</h2>
      <ul class="flex flex-wrap gap-2">
        <li v-for="group in region.versionGroups" :key="group"><NuxtLinkLocale :to="`/games/${group}`" class="chip">{{ labels.taxonomy('version-group', group) }}</NuxtLinkLocale></li>
      </ul>
    </section>

    <section v-if="region.pokedexes.length" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('regions.pokedexes') }}</h2>
      <ul class="flex flex-wrap gap-2">
        <li v-for="pokedex in region.pokedexes" :key="pokedex"><NuxtLinkLocale :to="`/pokedex/${pokedex}`" class="chip">{{ labels.taxonomy('pokedex', pokedex) }}</NuxtLinkLocale></li>
      </ul>
    </section>

    <section class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('regions.places', { count: locations.length }) }}</h2>
      <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="location in locations" :key="location.slug">
          <NuxtLinkLocale :to="`/locations/${location.slug}`" class="flex items-baseline justify-between gap-2 rounded-xl px-3 py-2 hover:bg-surface-2">
            <span class="font-medium">{{ name(location.names) }}<span v-if="altName(location.names)" class="ml-2 text-xs text-muted">{{ altName(location.names) }}</span></span>
            <span v-if="location.encounterCount" class="text-xs text-muted">{{ t('regions.wildCount', { count: location.encounterCount }) }}</span>
          </NuxtLinkLocale>
        </li>
      </ul>
    </section>
  </article>
</template>
