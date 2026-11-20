<script setup lang="ts">
import type { FormAbility } from '#shared/types/encyclopedia'

defineProps<{ abilities: FormAbility[] }>()

const { t } = useI18n()
const labels = useLabels()
const { altName } = useL10n()
const refs = useRefs()
</script>

<template>
  <ul class="space-y-4">
    <li v-for="ability in abilities" :key="ability.slug">
      <p class="font-semibold">
        <NuxtLinkLocale :to="`/abilities/${ability.slug}`" class="underline decoration-brand decoration-2 underline-offset-4">
          {{ labels.ability(ability.slug) }}
        </NuxtLinkLocale>
        <span v-if="refs.abilities[ability.slug] && altName(refs.abilities[ability.slug]!.names)" class="ml-2 text-sm font-normal text-muted">{{ altName(refs.abilities[ability.slug]!.names) }}</span>
        <span v-if="ability.hidden" class="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">{{ t('pokemon.hiddenAbility') }}</span>
      </p>
      <p v-if="refs.abilities[ability.slug]" class="text-sm text-muted"><LocalizedText :value="refs.abilities[ability.slug]!.shortEffect" /></p>
    </li>
  </ul>
</template>
