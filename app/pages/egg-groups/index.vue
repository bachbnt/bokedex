<script setup lang="ts">
const { t } = useI18n()
const { name, altName } = useL10n()
const { reference, status } = useReference()

useSeoMeta({ title: () => `${t('eggGroups.title')} | Bokedex`, description: () => t('eggGroups.description') })
</script>

<template>
  <div class="space-y-6">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">{{ t('eggGroups.title') }}</h1>
      <p class="text-lg text-muted">{{ t('eggGroups.lead') }}</p>
    </header>
    <div v-if="status === 'pending' && !reference" class="skeleton h-64" />
    <ul v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="group in reference?.eggGroups ?? []" :key="group.slug">
        <NuxtLinkLocale :to="`/egg-groups/${group.slug}`" class="panel flex items-baseline justify-between gap-3 p-5 transition-transform hover:-translate-y-1">
          <span>
            <span class="block font-display text-xl font-bold">{{ name(group.names) }}</span>
            <span v-if="altName(group.names)" class="text-xs text-muted">{{ altName(group.names) }}</span>
          </span>
          <span class="text-sm text-muted tabular-nums">{{ t('eggGroups.count', { count: group.count }) }}</span>
        </NuxtLinkLocale>
      </li>
    </ul>
  </div>
</template>
