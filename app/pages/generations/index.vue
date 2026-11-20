<script setup lang="ts">
const { t } = useI18n()
const { name, altName } = useL10n()
const labels = useLabels()
const { reference, status } = useReference()
useTaxonomyRefs()

useSeoMeta({ title: () => `${t('generations.title')} | Bokedex`, description: () => t('generations.description') })
</script>

<template>
  <div class="space-y-6">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">{{ t('generations.title') }}</h1>
      <p class="text-lg text-muted">{{ t('generations.lead') }}</p>
    </header>
    <div v-if="status === 'pending' && !reference" class="skeleton h-64" />
    <ul v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="generation in reference?.generations ?? []" :key="generation.id">
        <NuxtLinkLocale :to="`/generations/${generation.id}`" class="panel block p-5 transition-transform hover:-translate-y-1">
          <span class="block font-display text-2xl font-bold">{{ name(generation.names) }}</span>
          <span v-if="altName(generation.names)" class="text-sm text-muted">{{ altName(generation.names) }}</span>
          <span v-if="generation.region" class="mt-2 block text-sm text-muted">{{ labels.taxonomy('region', generation.region) }}</span>
        </NuxtLinkLocale>
      </li>
    </ul>
  </div>
</template>
