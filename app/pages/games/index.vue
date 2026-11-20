<script setup lang="ts">
const { t } = useI18n()
const { name } = useL10n()
const { reference, status } = useReference()

useSeoMeta({ title: () => `${t('games.title')} | Bokedex`, description: () => t('games.description') })

/** Games grouped by generation, oldest first. */
const byGeneration = computed(() => {
  const groups = new Map<number, NonNullable<typeof reference.value>['versionGroups']>()
  for (const group of (reference.value?.versionGroups ?? []).toSorted((a, b) => a.order - b.order)) {
    groups.set(group.generation, [...(groups.get(group.generation) ?? []), group])
  }
  return [...groups]
})
</script>

<template>
  <div class="space-y-8">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">{{ t('games.title') }}</h1>
      <p class="text-lg text-muted">{{ t('games.lead') }}</p>
    </header>
    <div v-if="status === 'pending' && !reference" class="skeleton h-64" />
    <section v-for="[generation, groups] in byGeneration" :key="generation">
      <h2 class="mb-3 text-2xl font-bold">{{ t('pokemon.generationN', { n: generation }) }}</h2>
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="group in groups" :key="group.slug">
          <NuxtLinkLocale :to="`/games/${group.slug}`" class="panel block p-5 transition-transform hover:-translate-y-1">
            <span class="font-display text-xl font-bold">{{ name(group.names) }}</span>
          </NuxtLinkLocale>
        </li>
      </ul>
    </section>
  </div>
</template>
