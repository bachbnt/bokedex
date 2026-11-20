<script setup lang="ts">
import type { AbilityRow, PokemonRow } from '#shared/types/encyclopedia'
import type { AbilityQuestion } from '~/utils/quiz'

const { t } = useI18n()
const { name, text } = useL10n()
const sprites = useSprites()
const { data: table, status } = useDataset<PokemonRow[]>('pokemon-table')
const { data: abilities } = useDataset<AbilityRow[]>('abilities')

const ready = computed(() => status.value === 'success' && (table.value?.length ?? 0) >= OPTION_COUNT && (abilities.value?.length ?? 0) > 0)
const abilityName = (slug: string) => {
  const row = abilities.value?.find(entry => entry.slug === slug)
  return row ? name(row.names) : titleCase(slug)
}

const choices = (question: AbilityQuestion) => question.options.map(row => ({
  key: String(row.id),
  label: name(row.names),
  image: sprites.artwork(row.id),
  hint: row.abilities.map(abilityName).join(t('common.listSeparator')),
}))
</script>

<template>
  <QuizMultipleChoice
    game="abilityGuess"
    icon="sparkle"
    layout="image"
    :title="t('play.abilityGuess')"
    :intro="t('play.abilityGuessIntro')"
    :ready="ready"
    :create-question="() => createAbilityQuestion(table ?? [], abilities ?? [])"
    :choices="choices"
    :correct="question => String(question.answer.id)"
  >
    <template #prompt="{ question }">
      <p class="text-muted">{{ t('play.abilityGuessPrompt') }}</p>
      <p class="font-display text-3xl font-extrabold">{{ name((question as AbilityQuestion).ability.names) }}</p>
      <p v-if="text((question as AbilityQuestion).ability.shortEffect)" class="mx-auto mt-2 max-w-md text-sm text-muted">{{ text((question as AbilityQuestion).ability.shortEffect) }}</p>
    </template>
    <template #feedback="{ question }">
      {{ t('play.abilityGuessAnswer', { name: name((question as AbilityQuestion).answer.names), ability: name((question as AbilityQuestion).ability.names) }) }}
    </template>
  </QuizMultipleChoice>
</template>
