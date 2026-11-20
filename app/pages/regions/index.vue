<script setup lang="ts">
const { t } = useI18n()
const { name, altName } = useL10n()
const { reference, status } = useReference()

useSeoMeta({ title: () => `${t('regions.title')} | Bokedex`, description: () => t('regions.description') })
</script>

<template>
  <div class="space-y-6">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">{{ t('regions.title') }}</h1>
      <p class="text-lg text-muted">{{ t('regions.lead') }}</p>
    </header>
    <div v-if="status === 'pending' && !reference" class="skeleton h-64" />
    <ul v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="region in reference?.regions ?? []" :key="region.slug">
        <NuxtLinkLocale :to="`/regions/${region.slug}`" class="panel block p-5 transition-transform hover:-translate-y-1">
          <span class="block font-display text-2xl font-bold">{{ name(region.names) }}</span>
          <span v-if="altName(region.names)" class="text-sm text-muted">{{ altName(region.names) }}</span>
        </NuxtLinkLocale>
      </li>
    </ul>
  </div>
</template>
