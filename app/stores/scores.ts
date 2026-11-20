import { skipHydrate } from 'pinia'

export type GameKey = 'silhouette' | 'typeMaster'

interface GameRecord {
  best: number
  played: number
}

/** High scores for the mini-games. */
export const useScoresStore = defineStore('scores', () => {
  const records = useLocalStorage<Record<GameKey, GameRecord>>(
    'bokedex:scores',
    { silhouette: { best: 0, played: 0 }, typeMaster: { best: 0, played: 0 } },
    { initOnMounted: true, mergeDefaults: true },
  )

  /** Records a finished run and reports whether it set a new best. */
  function submit(game: GameKey, score: number): boolean {
    const record = records.value[game]
    const isBest = score > record.best
    records.value = {
      ...records.value,
      [game]: { best: Math.max(record.best, score), played: record.played + 1 },
    }
    return isBest
  }

  // skipHydrate: localStorage is the source of truth, not the server-rendered state (see collection store).
  return { records: skipHydrate(records), submit }
})
