<script setup lang="ts">
const { t } = useI18n()
const { name, altName } = useL10n()
const { refs } = useTaxonomyRefs()
const labels = useLabels(refs)
const { reference, status } = useReference()

useSeoMeta({ title: () => `${t('pokedexes.title')} | Bokedex`, description: () => t('pokedexes.description') })

/** Mainline Pokédexes first; side-game dexes (Conquest, Hyperspace...) after. */
const sorted = computed(() => (reference.value?.pokedexes ?? []).toSorted((a, b) => Number(b.mainSeries) - Number(a.mainSeries)))
</script>

<template>
  <div class="space-y-6">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">{{ t('pokedexes.title') }}</h1>
      <p class="text-lg text-muted">{{ t('pokedexes.lead') }}</p>
    </header>
    <div v-if="status === 'pending' && !reference" class="skeleton h-64" />
    <ul v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="pokedex in sorted" :key="pokedex.slug">
        <NuxtLinkLocale :to="`/pokedex/${pokedex.slug}`" class="panel flex items-baseline justify-between gap-3 p-5 transition-transform hover:-translate-y-1">
          <span>
            <span class="block font-display text-xl font-bold">{{ labels.taxonomy('pokedex', pokedex.slug) }}</span>
            <span v-if="altName(pokedex.names)" class="text-xs text-muted">{{ altName(pokedex.names) }}</span>
          </span>
          <span class="text-sm text-muted tabular-nums">{{ t('pokedexes.count', { count: pokedex.count }) }}</span>
        </NuxtLinkLocale>
      </li>
    </ul>
  </div>
</template>
