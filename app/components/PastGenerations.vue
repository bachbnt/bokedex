<script setup lang="ts">
import type { PokemonForm } from '#shared/types/encyclopedia'

defineProps<{ form: PokemonForm }>()

const { t } = useI18n()
const labels = useLabels()
</script>

<template>
  <ul class="space-y-3 text-sm">
    <li v-for="past in form.pastTypes" :key="`type-${past.untilGeneration}`" class="flex flex-wrap items-center gap-2">
      <span class="font-semibold">{{ t('pokemon.pastTypes', { n: past.untilGeneration }) }}</span>
      <TypeBadge v-for="type in past.types" :key="type" :type="type" size="sm" />
    </li>
    <li v-for="past in form.pastStats" :key="`stats-${past.untilGeneration}`">
      <span class="font-semibold">{{ t('pokemon.pastStats', { n: past.untilGeneration }) }}</span>
      <span class="ml-2 text-muted">{{ past.stats.map(stat => `${labels.taxonomy('stat', stat.key)} ${stat.value}`).join(t('common.listSeparator')) }}</span>
    </li>
    <li v-for="past in form.pastAbilities" :key="`ability-${past.untilGeneration}`">
      <span class="font-semibold">{{ t('pokemon.pastAbilities', { n: past.untilGeneration }) }}</span>
      <span class="ml-2 text-muted">{{ past.abilities.length ? past.abilities.map(ability => labels.ability(ability.slug)).join(t('common.listSeparator')) : t('common.none') }}</span>
    </li>
  </ul>
</template>
