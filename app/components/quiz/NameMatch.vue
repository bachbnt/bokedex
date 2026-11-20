<script setup lang="ts">
import type { NameMatchQuestion } from '~/utils/quiz'

const { t } = useI18n()
const { name, altName } = useL10n()
const { pokemon } = useDex()

const ready = computed(() => pokemon.value.length >= OPTION_COUNT)
const choices = (question: NameMatchQuestion) => question.options.map(entry => ({ key: String(entry.id), label: name(entry.names) }))
</script>

<template>
  <QuizMultipleChoice
    game="nameMatch"
    icon="globe"
    :title="t('play.nameMatch')"
    :intro="t('play.nameMatchIntro')"
    :ready="ready"
    :create-question="() => createNameMatch(pokemon)"
    :choices="choices"
    :correct="question => String(question.answer.id)"
  >
    <template #prompt="{ question }">
      <p class="text-muted">{{ t('play.nameMatchPrompt') }}</p>
      <p class="font-display text-4xl font-extrabold">{{ altName((question as NameMatchQuestion).answer.names) }}</p>
    </template>
    <template #feedback="{ question }">
      {{ t('play.nameMatchResult', { alt: altName((question as NameMatchQuestion).answer.names), name: name((question as NameMatchQuestion).answer.names) }) }}
    </template>
  </QuizMultipleChoice>
</template>
