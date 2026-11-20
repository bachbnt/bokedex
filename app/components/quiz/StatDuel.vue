<script setup lang="ts">
import type { PokemonRow } from '#shared/types/encyclopedia'
import type { StatChoice, StatDuelQuestion } from '~/utils/quiz'

const { t } = useI18n()
const { name } = useL10n()
const sprites = useSprites()
const { refs } = useTaxonomyRefs()
const labels = useLabels(refs)
const { data: table, status } = useDataset<PokemonRow[]>('pokemon-table')

const ready = computed(() => status.value === 'success' && (table.value?.length ?? 0) > 1)
const statLabel = (stat: StatChoice) => (stat === 'total' ? t('pokemon.statTotal') : labels.taxonomy('stat', stat))

const choices = (question: StatDuelQuestion) => [
  { key: 'a', label: name(question.a.names), image: sprites.artwork(question.a.id), hint: String(statValue(question.a, question.stat)) },
  { key: 'b', label: name(question.b.names), image: sprites.artwork(question.b.id), hint: String(statValue(question.b, question.stat)) },
]
</script>

<template>
  <QuizMultipleChoice
    game="statDuel"
    icon="scale"
    layout="image"
    :title="t('play.statDuel')"
    :intro="t('play.statDuelIntro')"
    :ready="ready"
    :create-question="() => createStatDuel(table ?? [])"
    :choices="choices"
    :correct="statDuelWinner"
  >
    <template #prompt="{ question }">
      <p class="text-muted">{{ t('play.statDuelPrompt') }}</p>
      <p class="font-display text-3xl font-extrabold">{{ statLabel((question as StatDuelQuestion).stat) }}</p>
    </template>
    <template #feedback="{ question }">
      {{ t('play.statDuelResult', { a: name((question as StatDuelQuestion).a.names), av: statValue((question as StatDuelQuestion).a, (question as StatDuelQuestion).stat), b: name((question as StatDuelQuestion).b.names), bv: statValue((question as StatDuelQuestion).b, (question as StatDuelQuestion).stat) }) }}
    </template>
  </QuizMultipleChoice>
</template>
