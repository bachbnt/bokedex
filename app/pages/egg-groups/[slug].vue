<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { name } = useL10n()
const { entity: group } = await useEntity('egg-groups', () => String(route.params.slug))

useSeoMeta({ title: () => `${name(group.value.names)} | Bokedex`, description: () => t('eggGroups.seoFallback', { name: name(group.value.names) }) })
</script>

<template>
  <article class="space-y-6">
    <NuxtLinkLocale to="/egg-groups" class="btn btn-ghost w-fit !px-4">
      <AppIcon name="arrow-left" :size="18" />
      {{ t('eggGroups.title') }}
    </NuxtLinkLocale>
    <EntityHeader :names="group.names" :kicker="t('eggGroups.kicker')">
      <span class="text-sm text-muted">{{ t('eggGroups.count', { count: group.species.length }) }}</span>
    </EntityHeader>
    <section class="panel p-6">
      <PokemonGrid :ids="group.species" />
    </section>
  </article>
</template>
