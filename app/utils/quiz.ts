import type { AbilityRow, DexEntry, PokemonRow } from '#shared/types/encyclopedia'
import { sample, shuffle } from '~/utils/dex'

/** Question makers for the multiple-choice quizzes. Pure, so they are easy to test with any dataset. */

export const OPTION_COUNT = 4

// ---- Stat duel: which of two Pokémon has the higher stat? ----

export type StatChoice = 'hp' | 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed' | 'total'
export const DUEL_STATS: StatChoice[] = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed', 'total']

export interface StatDuelQuestion {
  stat: StatChoice
  a: PokemonRow
  b: PokemonRow
}

export function statValue(row: PokemonRow, stat: StatChoice): number {
  if (stat === 'total') return row.statTotal
  return row.stats[DUEL_STATS.indexOf(stat)] ?? 0
}

/** The Pokémon with the higher value. Never a tie: the maker only draws pairs that differ. */
export const statDuelWinner = (question: StatDuelQuestion): 'a' | 'b' =>
  statValue(question.a, question.stat) > statValue(question.b, question.stat) ? 'a' : 'b'

export function createStatDuel(rows: PokemonRow[], stat: StatChoice = sample(DUEL_STATS, 1)[0]!): StatDuelQuestion {
  const a = sample(rows, 1)[0]!
  // The rival is drawn from those with a different value, so there is always a right answer.
  const rivals = rows.filter(row => row.id !== a.id && statValue(row, stat) !== statValue(a, stat))
  const b = sample(rivals.length ? rivals : rows.filter(row => row.id !== a.id), 1)[0]!
  return { stat, a, b }
}

// ---- Name match: the name in the other language, pick the matching name ----

export interface NameMatchQuestion {
  answer: DexEntry
  options: DexEntry[]
}

export function createNameMatch(entries: DexEntry[], optionCount = OPTION_COUNT): NameMatchQuestion {
  // Both spellings must exist, or there is nothing to translate.
  const pool = entries.filter(entry => entry.names.ja)
  const [answer, ...others] = sample(pool, optionCount) as [DexEntry, ...DexEntry[]]
  return { answer, options: shuffle([answer, ...others]) }
}

// ---- Ability: which Pokémon can have this ability? ----

export interface AbilityQuestion {
  ability: AbilityRow
  answer: PokemonRow
  options: PokemonRow[]
}

export function createAbilityQuestion(rows: PokemonRow[], abilities: AbilityRow[], optionCount = OPTION_COUNT): AbilityQuestion {
  const owned = new Set(rows.flatMap(row => row.abilities))
  const candidates = abilities.filter(ability => owned.has(ability.slug))
  const ability = sample(candidates, 1)[0]!
  const answer = sample(rows.filter(row => row.abilities.includes(ability.slug)), 1)[0]!
  const others = sample(rows.filter(row => !row.abilities.includes(ability.slug)), optionCount - 1)
  return { ability, answer, options: shuffle([answer, ...others]) }
}
