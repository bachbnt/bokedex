import type { GameKey } from '~/stores/scores'

export type QuizPhase = 'idle' | 'playing' | 'finished'
export type RoundResult = 'correct' | 'wrong' | null

interface QuizConfig<Q> {
  game: GameKey
  rounds?: number
  createQuestion: () => Q
}

/**
 * Round, score and streak bookkeeping shared by every mini-game.
 * A game only supplies how to make a question and whether an answer is right.
 */
export function useQuiz<Q>({ game, rounds = 10, createQuestion }: QuizConfig<Q>) {
  const scores = useScoresStore()

  const phase = ref<QuizPhase>('idle')
  const round = ref(0)
  const score = ref(0)
  const streak = ref(0)
  const bestStreak = ref(0)
  const newBest = ref(false)
  const result = ref<RoundResult>(null)
  const question = shallowRef<Q | null>(null)

  const isLastRound = computed(() => round.value >= rounds)

  function start() {
    round.value = 1
    score.value = 0
    streak.value = 0
    bestStreak.value = 0
    newBest.value = false
    result.value = null
    question.value = createQuestion()
    phase.value = 'playing'
  }

  function submit(correct: boolean) {
    if (result.value) return
    result.value = correct ? 'correct' : 'wrong'
    if (correct) {
      score.value++
      streak.value++
      bestStreak.value = Math.max(bestStreak.value, streak.value)
    }
    else {
      streak.value = 0
    }
  }

  function next() {
    if (!result.value) return
    if (isLastRound.value) {
      newBest.value = scores.submit(game, score.value)
      phase.value = 'finished'
      return
    }
    round.value++
    result.value = null
    question.value = createQuestion()
  }

  return { rounds, phase, round, score, streak, bestStreak, newBest, result, question, isLastRound, start, submit, next }
}
