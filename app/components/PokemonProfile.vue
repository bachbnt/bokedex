<script setup lang="ts">
import type { PokemonForm, SpeciesEntry } from '#shared/types/encyclopedia'

const props = defineProps<{ species: SpeciesEntry, form: PokemonForm }>()

const { t } = useI18n()
const labels = useLabels()

const STEPS_PER_EGG_CYCLE = 255

const femalePercent = computed(() => {
  const eighths = props.species.genderFemaleEighths
  return eighths === null ? null : (eighths / 8) * 100
})

const unknown = computed(() => t('common.unknown'))
const facts = computed(() => [
  { label: t('pokemon.height'), value: `${props.form.heightM} m` },
  { label: t('pokemon.weight'), value: `${props.form.weightKg} kg` },
  { label: t('pokemon.baseExperience'), value: props.form.baseExperience ?? unknown.value },
  { label: t('pokemon.captureRate'), value: props.species.captureRate ?? unknown.value },
  { label: t('pokemon.baseFriendship'), value: props.species.baseHappiness ?? unknown.value },
  { label: t('pokemon.growthRate'), value: props.species.growthRate ? labels.taxonomy('growth-rate', props.species.growthRate) : unknown.value },
  { label: t('pokemon.hatchSteps'), value: props.species.hatchCounter === null ? unknown.value : (props.species.hatchCounter * STEPS_PER_EGG_CYCLE).toLocaleString() },
  { label: t('pokemon.habitat'), value: props.species.habitat ? labels.taxonomy('habitat', props.species.habitat) : unknown.value },
  { label: t('pokemon.color'), value: props.species.color ? labels.taxonomy('color', props.species.color) : unknown.value },
  { label: t('pokemon.shape'), value: props.species.shape ? labels.taxonomy('shape', props.species.shape) : unknown.value },
])
</script>

<template>
  <div>
    <dl class="grid grid-cols-2 gap-x-6 gap-y-4">
      <div v-for="fact in facts" :key="fact.label">
        <dt class="text-sm text-muted">{{ fact.label }}</dt>
        <dd class="font-semibold">{{ fact.value }}</dd>
      </div>
      <div class="col-span-2">
        <dt class="text-sm text-muted">{{ t('pokemon.eggGroups') }}</dt>
        <dd class="flex flex-wrap gap-2 pt-1">
          <NuxtLinkLocale v-for="group in species.eggGroups" :key="group" :to="`/egg-groups/${group}`" class="chip">
            {{ labels.taxonomy('egg-group', group) }}
          </NuxtLinkLocale>
          <span v-if="!species.eggGroups.length" class="font-semibold">{{ t('common.none') }}</span>
        </dd>
      </div>
      <div class="col-span-2">
        <dt class="text-sm text-muted">{{ t('pokemon.generation') }}</dt>
        <dd>
          <NuxtLinkLocale :to="`/generations/${species.generation}`" class="font-semibold underline decoration-brand decoration-2 underline-offset-4">
            {{ t('pokemon.generationN', { n: species.generation }) }}
          </NuxtLinkLocale>
        </dd>
      </div>
    </dl>

    <div v-if="femalePercent !== null" class="mt-5">
      <p class="mb-1.5 text-sm text-muted">{{ t('pokemon.genderRatio') }}</p>
      <div class="flex h-3 overflow-hidden rounded-full" role="img" :aria-label="t('pokemon.genderSplit', { male: 100 - femalePercent, female: femalePercent })">
        <div class="bg-[#6390f0]" :style="{ width: `${100 - femalePercent}%` }" />
        <div class="bg-[#f95587]" :style="{ width: `${femalePercent}%` }" />
      </div>
      <p class="mt-1.5 flex justify-between text-sm">
        <span>{{ t('pokemon.male', { percent: 100 - femalePercent }) }}</span>
        <span>{{ t('pokemon.female', { percent: femalePercent }) }}</span>
      </p>
    </div>
    <p v-else class="mt-5 text-sm text-muted">{{ t('pokemon.genderless') }}</p>

    <div v-if="species.pokedexNumbers.length > 1" class="mt-5">
      <p class="mb-1.5 text-sm text-muted">{{ t('pokemon.pokedexNumbers') }}</p>
      <ul class="flex flex-wrap gap-2">
        <li v-for="entry in species.pokedexNumbers" :key="entry.pokedex">
          <NuxtLinkLocale :to="`/pokedex/${entry.pokedex}`" class="chip">
            {{ labels.taxonomy('pokedex', entry.pokedex) }}
            <span class="font-display font-bold tabular-nums">#{{ entry.number }}</span>
          </NuxtLinkLocale>
        </li>
      </ul>
    </div>
  </div>
</template>
