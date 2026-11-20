<script setup lang="ts">
import type { DexEntry } from '#shared/types/pokedex'

type Verdict = 'immune' | 'resisted' | 'neutral' | 'super'

interface Question {
  attacker: string
  defender: DexEntry
  multiplier: number
}

const CHOICES: { verdict: Verdict, label: string }[] = [
  { verdict: 'immune', label: 'No effect' },
  { verdict: 'resisted', label: 'Not very effective' },
  { verdict: 'neutral', label: 'Normal damage' },
  { verdict: 'super', label: 'Super effective' },
]

/** Share of rounds that must be a "surprising" matchup so the quiz isn't all neutral hits. */
const INTERESTING_RATE = 0.8
const MAX_ATTEMPTS = 12

const { pokemon } = useDex()
const { types, effectiveness, status } = useTypeChart()
const sprites = useSprites()
const scores = useScoresStore()

const picked = ref<Verdict | null>(null)

const verdictOf = (multiplier: number): Verdict =>
  multiplier === 0 ? 'immune' : multiplier < 1 ? 'resisted' : multiplier > 1 ? 'super' : 'neutral'

function createQuestion(): Question {
  const wantInteresting = Math.random() < INTERESTING_RATE
  let question!: Question
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const attacker = sample(types.value, 1)[0]!
    const defender = sample(pokemon.value, 1)[0]!
    question = { attacker, defender, multiplier: effectiveness(attacker, defender.types) }
    if (!wantInteresting || question.multiplier !== 1) break
  }
  return question
}

const quiz = useQuiz<Question>({ game: 'typeMaster', createQuestion })
const ready = computed(() => status.value === 'success' && pokemon.value.length > 0)

function choose(verdict: Verdict) {
  const question = quiz.question.value
  if (quiz.result.value || !question) return
  picked.value = verdict
  quiz.submit(verdict === verdictOf(question.multiplier))
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
  const choice = CHOICES[Number(event.key) - 1]
  if (choice) choose(choice.verdict)
})
onKeyStroke('Enter', () => {
  if (quiz.phase.value === 'playing' && quiz.result.value) advance()
})

function choiceClass(verdict: Verdict) {
  const question = quiz.question.value
  if (!quiz.result.value || !question) return 'border-line bg-surface hover:-translate-y-0.5 hover:border-muted'
  if (verdict === verdictOf(question.multiplier)) return 'border-good bg-good/15 text-good'
  if (verdict === picked.value) return 'border-bad bg-bad/15 text-bad animate-shake'
  return 'border-line bg-surface opacity-50'
}
</script>

<template>
  <section class="panel p-6 sm:p-8" aria-labelledby="typemaster-title">
    <template v-if="quiz.phase.value === 'idle'">
      <div class="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <span class="grid h-[72px] w-[72px] place-items-center rounded-full bg-glow text-[#12163a]">
          <AppIcon name="bolt" :size="36" filled />
        </span>
        <h2 id="typemaster-title" class="text-3xl font-extrabold">Type master</h2>
        <p class="text-muted">
          A move of one type hits a Pokémon. How much damage does it do? Ten rounds that train the type chart the games expect you to know.
        </p>
        <button type="button" class="btn btn-brand w-full" :disabled="!ready" @click="begin">Start</button>
        <p class="text-sm text-muted">Best {{ scores.records.typeMaster.best }}/10, played {{ scores.records.typeMaster.played }} times</p>
      </div>
    </template>

    <template v-else-if="quiz.phase.value === 'playing' && quiz.question.value">
      <div class="mx-auto max-w-xl space-y-6">
        <GameRoundHeader :round="quiz.round.value" :rounds="quiz.rounds" :score="quiz.score.value" :streak="quiz.streak.value" />

        <div
          class="flex flex-col items-center gap-3 rounded-[28px] p-6 text-center"
          :style="{ ...pokemonTheme(quiz.question.value.defender.types), backgroundImage: 'radial-gradient(circle at 50% 30%, color-mix(in oklab, var(--poke) 35%, transparent), transparent 75%)' }"
        >
          <p class="flex flex-wrap items-center justify-center gap-2 font-semibold">
            A <TypeBadge :type="quiz.question.value.attacker" /> move hits
          </p>
          <img
            :key="quiz.question.value.defender.id"
            :src="sprites.artwork(quiz.question.value.defender.id)"
            :alt="titleCase(quiz.question.value.defender.name)"
            width="475"
            height="475"
            class="animate-pop h-40 w-40 object-contain drop-shadow-[0_12px_10px_rgb(0_0_0/0.3)]"
          >
          <p class="font-display text-2xl font-bold">{{ titleCase(quiz.question.value.defender.name) }}</p>
          <div class="flex gap-1.5">
            <TypeBadge v-for="type in quiz.question.value.defender.types" :key="type" :type="type" size="sm" />
          </div>
        </div>

        <ul class="grid gap-3 sm:grid-cols-2" aria-label="How effective is the move?">
          <li v-for="(choice, index) in CHOICES" :key="choice.verdict">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-semibold transition-all"
              :class="choiceClass(choice.verdict)"
              :disabled="Boolean(quiz.result.value)"
              @click="choose(choice.verdict)"
            >
              <kbd class="grid h-6 w-6 place-items-center rounded-md bg-surface-2 text-xs text-muted">{{ index + 1 }}</kbd>
              {{ choice.label }}
            </button>
          </li>
        </ul>

        <div class="flex min-h-12 items-center justify-between gap-3" aria-live="polite">
          <p v-if="quiz.result.value" class="font-semibold">
            {{ quiz.result.value === 'correct' ? 'Correct.' : 'Not quite.' }}
            {{ titleCase(quiz.question.value.attacker) }} does {{ formatMultiplier(quiz.question.value.multiplier) }}× here.
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
      :best="scores.records.typeMaster.best"
      :best-streak="quiz.bestStreak.value"
      :new-best="quiz.newBest.value"
      @replay="begin"
    />
  </section>
</template>
