<script setup lang="ts">
import type { DexEntry } from '#shared/types/pokedex'

const OPTION_COUNT = 4

interface Question {
  answer: DexEntry
  options: DexEntry[]
}

const { pokemon, generations } = useDex()
const sprites = useSprites()
const scores = useScoresStore()

const gen = ref(0)
const picked = ref<number | null>(null)
const imageReady = ref(false)

const pool = computed(() => (gen.value ? pokemon.value.filter(entry => entry.gen === gen.value) : pokemon.value))
const canPlay = computed(() => pool.value.length >= OPTION_COUNT)

function createQuestion(): Question {
  const [answer, ...others] = sample(pool.value, OPTION_COUNT) as [DexEntry, ...DexEntry[]]
  return { answer, options: shuffle([answer, ...others]) }
}

const quiz = useQuiz<Question>({ game: 'silhouette', createQuestion })

function choose(entry: DexEntry) {
  if (quiz.result.value || !quiz.question.value) return
  picked.value = entry.id
  quiz.submit(entry.id === quiz.question.value.answer.id)
}

function advance() {
  picked.value = null
  imageReady.value = false
  quiz.next()
}

function begin() {
  picked.value = null
  imageReady.value = false
  quiz.start()
}

// Keys 1–4 answer, Enter / Space continues.
onKeyStroke(['1', '2', '3', '4'], (event) => {
  if (quiz.phase.value !== 'playing') return
  const option = quiz.question.value?.options[Number(event.key) - 1]
  if (option) choose(option)
})
onKeyStroke('Enter', () => {
  if (quiz.phase.value === 'playing' && quiz.result.value) advance()
})

function optionClass(entry: DexEntry) {
  if (!quiz.result.value || !quiz.question.value) return 'border-line bg-surface hover:-translate-y-0.5 hover:border-muted'
  if (entry.id === quiz.question.value.answer.id) return 'border-good bg-good/15 text-good'
  if (entry.id === picked.value) return 'border-bad bg-bad/15 text-bad animate-shake'
  return 'border-line bg-surface opacity-50'
}
</script>

<template>
  <section class="panel p-6 sm:p-8" aria-labelledby="silhouette-title">
    <template v-if="quiz.phase.value === 'idle'">
      <div class="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <PokeBall :size="72" shake />
        <h2 id="silhouette-title" class="text-3xl font-extrabold">Who's that Pokémon?</h2>
        <p class="text-muted">
          Ten silhouettes, four names each. Keep a streak going to climb your best score.
        </p>
        <label class="w-full">
          <span class="mb-1.5 block text-left text-sm font-medium text-muted">Generation</span>
          <select v-model.number="gen" class="input cursor-pointer">
            <option :value="0">All generations</option>
            <option v-for="generation in generations" :key="generation.id" :value="generation.id">
              {{ generation.label }}{{ generation.region ? `: ${titleCase(generation.region)}` : '' }}
            </option>
          </select>
        </label>
        <button type="button" class="btn btn-brand w-full" :disabled="!canPlay" @click="begin">Start</button>
        <p class="text-sm text-muted">Best {{ scores.records.silhouette.best }}/10, played {{ scores.records.silhouette.played }} times</p>
      </div>
    </template>

    <template v-else-if="quiz.phase.value === 'playing' && quiz.question.value">
      <div class="mx-auto max-w-xl space-y-6">
        <GameRoundHeader :round="quiz.round.value" :rounds="quiz.rounds" :score="quiz.score.value" :streak="quiz.streak.value" />

        <div
          class="relative mx-auto grid aspect-square w-full max-w-72 place-items-center overflow-hidden rounded-[28px]"
          :style="{ backgroundImage: 'radial-gradient(circle at 50% 45%, color-mix(in oklab, var(--glow) 55%, transparent), color-mix(in oklab, var(--brand) 18%, transparent) 70%)' }"
        >
          <img
            :key="quiz.question.value.answer.id"
            :src="sprites.artwork(quiz.question.value.answer.id)"
            :alt="quiz.result.value ? titleCase(quiz.question.value.answer.name) : 'Silhouette of a mystery Pokémon'"
            width="475"
            height="475"
            class="h-5/6 w-5/6 object-contain transition-[filter,transform,opacity] duration-700"
            :class="[imageReady ? 'opacity-100' : 'opacity-0', quiz.result.value ? 'scale-110' : '']"
            :style="{ filter: quiz.result.value ? 'none' : 'brightness(0) drop-shadow(0 6px 0 rgb(0 0 0 / 0.15))' }"
            @load="imageReady = true"
            @error="imageReady = true"
          >
        </div>

        <ul class="grid gap-3 sm:grid-cols-2" aria-label="Choose the Pokémon">
          <li v-for="(option, index) in quiz.question.value.options" :key="option.id">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-semibold transition-all"
              :class="optionClass(option)"
              :disabled="Boolean(quiz.result.value)"
              @click="choose(option)"
            >
              <kbd class="grid h-6 w-6 place-items-center rounded-md bg-surface-2 text-xs text-muted">{{ index + 1 }}</kbd>
              {{ titleCase(option.name) }}
            </button>
          </li>
        </ul>

        <div class="flex min-h-12 items-center justify-between gap-3" aria-live="polite">
          <p v-if="quiz.result.value" class="font-semibold">
            <template v-if="quiz.result.value === 'correct'">Correct! It's {{ titleCase(quiz.question.value.answer.name) }}.</template>
            <template v-else>Not quite. It was {{ titleCase(quiz.question.value.answer.name) }}.</template>
          </p>
          <span v-else />
          <button v-if="quiz.result.value" type="button" class="btn" @click="advance">
            {{ quiz.isLastRound.value ? 'See results' : 'Next' }}
          </button>
        </div>
      </div>
    </template>

    <GameResult
      v-else
      :score="quiz.score.value"
      :total="quiz.rounds"
      :best="scores.records.silhouette.best"
      :best-streak="quiz.bestStreak.value"
      :new-best="quiz.newBest.value"
      @replay="begin"
    />
  </section>
</template>
