<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { name, locale } = useL10n()
const { entity: ability } = await useEntity('abilities', () => String(route.params.slug))

useSeoMeta({
  title: () => `${name(ability.value.names)} | Bokedex`,
  description: () => ability.value.shortEffect[locale.value] ?? ability.value.shortEffect.en ?? t('abilities.seoFallback', { name: name(ability.value.names) }),
})

const notes = computed(() => Object.fromEntries(ability.value.pokemon.filter(entry => entry.hidden).map(entry => [entry.id, t('pokemon.hiddenAbility')])))
const sameText = computed(() => ability.value.effect.en === ability.value.shortEffect.en)
</script>

<template>
  <article class="space-y-6">
    <NuxtLinkLocale to="/abilities" class="btn btn-ghost w-fit !px-4">
      <AppIcon name="arrow-left" :size="18" />
      {{ t('abilities.listTitle') }}
    </NuxtLinkLocale>

    <EntityHeader :names="ability.names" :kicker="t('abilities.kicker')">
      <NuxtLinkLocale :to="`/generations/${ability.generation}`" class="chip">{{ t('pokemon.generationN', { n: ability.generation }) }}</NuxtLinkLocale>
      <p class="basis-full pt-2 text-lg"><LocalizedText :value="ability.shortEffect" /></p>
    </EntityHeader>

    <section v-if="!sameText && (ability.effect.en || ability.effect.ja)" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('abilities.sections.details') }}</h2>
      <p class="max-w-prose leading-relaxed"><LocalizedText :value="ability.effect" /></p>
    </section>

    <section class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('abilities.sections.pokemon', { count: ability.pokemon.length }) }}</h2>
      <PokemonGrid v-if="ability.pokemon.length" :ids="ability.pokemon.map(entry => entry.id)" :notes="notes" />
      <p v-else class="text-muted">{{ t('abilities.noPokemon') }}</p>
    </section>

    <section v-if="ability.flavor.length" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('moves.sections.descriptions') }}</h2>
      <VersionTexts :entries="ability.flavor" />
    </section>
  </article>
</template>
