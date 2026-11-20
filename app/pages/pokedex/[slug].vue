<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { name } = useL10n()
const { entity: pokedex, refs } = await useEntity('pokedexes', () => String(route.params.slug))
const labels = useLabels(refs)

const title = computed(() => labels.taxonomy('pokedex', pokedex.value.slug) || name(pokedex.value.names))
useSeoMeta({ title: () => `${title.value} | Bokedex`, description: () => t('pokedexes.seoFallback', { name: title.value }) })

const ordered = computed(() => pokedex.value.entries.toSorted((a, b) => a.number - b.number))
const notes = computed(() => Object.fromEntries(ordered.value.map(entry => [entry.id, `#${entry.number}`])))
</script>

<template>
  <article class="space-y-6">
    <NuxtLinkLocale to="/pokedex" class="btn btn-ghost w-fit !px-4">
      <AppIcon name="arrow-left" :size="18" />
      {{ t('pokedexes.title') }}
    </NuxtLinkLocale>
    <EntityHeader :names="{ ...pokedex.names, en: title }" :kicker="t('pokedexes.kicker')">
      <NuxtLinkLocale v-if="pokedex.region" :to="`/regions/${pokedex.region}`" class="chip">{{ labels.taxonomy('region', pokedex.region) }}</NuxtLinkLocale>
      <span class="text-sm text-muted">{{ t('pokedexes.count', { count: pokedex.entries.length }) }}</span>
      <p v-if="pokedex.description.en || pokedex.description.ja" class="basis-full pt-2 text-lg"><LocalizedText :value="pokedex.description" /></p>
    </EntityHeader>
    <section class="panel p-6">
      <PokemonGrid :ids="ordered.map(entry => entry.id)" :notes="notes" />
    </section>
  </article>
</template>
