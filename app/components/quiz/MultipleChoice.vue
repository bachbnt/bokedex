<script setup lang="ts" generic="Q">
import type { GameKey } from '~/stores/scores'

export interface QuizChoice {
  key: string
  label: string
  hint?: string
  image?: string
}

const props = defineProps<{
  game: GameKey
  icon: string
  title: string
  intro: string
  ready: boolean
  createQuestion: () => Q
  choices: (question: Q) => QuizChoice[]
  correct: (question: Q) => string
  /** `image` lays the options out as large picture cards; `text` as a list of buttons. */
  layout?: 'text' | 'image'
}>()

const { t } = useI18n()
const scores = useScoresStore()

const picked = ref<string | null>(null)
const quiz = useQuiz<Q>({ game: props.game, createQuestion: props.createQuestion })

const options = computed(() => (quiz.question.value ? props.choices(quiz.question.value) : []))
const answerKey = computed(() => (quiz.question.value ? props.correct(quiz.question.value) : ''))

function choose(key: string) {
  if (quiz.result.value || !quiz.question.value) return
  picked.value = key
  quiz.submit(key === answerKey.value)
}

function advance() {
  picked.value = null
  quiz.next()
}

function begin() {
  picked.value = null
  quiz.start()
}

onKeyStroke(['1', '2', '3', '4'], (event) => {
  if (quiz.phase.value !== 'playing') return
  const option = options.value[Number(event.key) - 1]
  if (option) choose(option.key)
})
onKeyStroke('Enter', () => {
  if (quiz.phase.value === 'playing' && quiz.result.value) advance()
})

function stateClass(key: string) {
  if (!quiz.result.value) return 'border-line bg-surface hover:-translate-y-0.5 hover:border-muted'
  if (key === answerKey.value) return 'border-good bg-good/15 text-good'
  if (key === picked.value) return 'border-bad bg-bad/15 text-bad animate-shake'
  return 'border-line bg-surface opacity-50'
}
</script>

<template>
  <section class="panel p-6 sm:p-8" :aria-label="title">
    <template v-if="quiz.phase.value === 'idle'">
      <div class="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <span class="grid h-[72px] w-[72px] place-items-center rounded-full bg-glow text-[#12163a]">
          <AppIcon :name="icon" :size="36" filled />
        </span>
        <h2 class="text-3xl font-extrabold">{{ title }}</h2>
        <p class="text-muted">{{ intro }}</p>
        <button type="button" class="btn btn-brand w-full" :disabled="!ready" @click="begin">{{ t('play.start') }}</button>
        <p class="text-sm text-muted">{{ t('play.record', { best: scores.records[game].best, played: scores.records[game].played }) }}</p>
      </div>
    </template>

    <template v-else-if="quiz.phase.value === 'playing' && quiz.question.value">
      <div class="mx-auto max-w-xl space-y-6">
        <QuizRoundHeader :round="quiz.round.value" :rounds="quiz.rounds" :score="quiz.score.value" :streak="quiz.streak.value" />

        <div class="rounded-[28px] bg-surface-2 p-6 text-center">
          <slot name="prompt" :question="quiz.question.value" />
        </div>

        <ul class="grid gap-3" :class="layout === 'image' ? 'grid-cols-2' : 'sm:grid-cols-2'" :aria-label="title">
          <li v-for="(option, index) in options" :key="option.key">
            <button
              type="button"
              class="flex w-full rounded-2xl border-2 text-left font-semibold transition-all"
              :class="[stateClass(option.key), layout === 'image' ? 'flex-col items-center gap-2 px-3 py-4 text-center' : 'items-center gap-3 px-4 py-3']"
              :disabled="Boolean(quiz.result.value)"
              @click="choose(option.key)"
            >
              <kbd class="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface-2 text-xs text-muted" :class="layout === 'image' ? 'self-start' : ''">{{ index + 1 }}</kbd>
              <img v-if="option.image" :src="option.image" alt="" width="475" height="475" class="h-28 w-28 object-contain drop-shadow-[0_8px_6px_rgb(0_0_0/0.25)]">
              <span class="min-w-0">
                <span class="block">{{ option.label }}</span>
                <span v-if="option.hint && quiz.result.value" class="block text-sm font-normal text-muted">{{ option.hint }}</span>
              </span>
            </button>
          </li>
        </ul>

        <div class="flex min-h-12 items-center justify-between gap-3" aria-live="polite">
          <p v-if="quiz.result.value" class="font-semibold">
            {{ quiz.result.value === 'correct' ? t('play.correctShort') : t('play.wrongShort') }}
            <slot name="feedback" :question="quiz.question.value" />
          </p>
          <span v-else />
          <button v-if="quiz.result.value" type="button" class="btn" @click="advance">
            {{ quiz.isLastRound.value ? t('play.results') : t('play.next') }}
          </button>
        </div>
      </div>
    </template>

    <QuizResult
      v-else
      :score="quiz.score.value"
      :total="quiz.rounds"
      :best="scores.records[game].best"
      :best-streak="quiz.bestStreak.value"
      :new-best="quiz.newBest.value"
      @replay="begin"
    />
  </section>
</template>
