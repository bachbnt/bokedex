/**
 * Contracts shared by the Nitro API layer and the Vue app.
 * Everything is derived from PokeAPI at runtime — nothing here enumerates
 * Pokémon, types or generations, so new additions flow through untouched.
 */

/** Compact row used by the grid, search, team picker and games. */
export interface DexEntry {
  id: number
  name: string
  types: string[]
  gen: number
}

export interface DexGeneration {
  id: number
  /** "Gen IV" */
  label: string
  /** "sinnoh" */
  region: string
}

export interface DexIndex {
  total: number
  generations: DexGeneration[]
  /** Only types that at least one Pokémon actually has. */
  types: string[]
  pokemon: DexEntry[]
}

export interface TypeRelations {
  doubleTo: string[]
  halfTo: string[]
  noTo: string[]
  doubleFrom: string[]
  halfFrom: string[]
  noFrom: string[]
}

export interface TypeInfo {
  name: string
  relations: TypeRelations
}

export interface PokemonStat {
  key: string
  value: number
}

export interface PokemonAbility {
  name: string
  hidden: boolean
  effect: string
}

export interface PokemonFlavor {
  version: string
  text: string
}

export interface EvolutionNode {
  id: number
  name: string
  /** Human readable requirement, e.g. "Lv. 16" or "Thunder Stone". Empty for the root. */
  condition: string
  evolvesTo: EvolutionNode[]
}

export interface PokemonDetail {
  id: number
  name: string
  genus: string
  types: string[]
  generation: number
  heightM: number
  weightKg: number
  baseExperience: number | null
  stats: PokemonStat[]
  statTotal: number
  abilities: PokemonAbility[]
  flavor: PokemonFlavor[]
  eggGroups: string[]
  habitat: string | null
  growthRate: string | null
  captureRate: number | null
  baseHappiness: number | null
  /** Share of females in eighths (0–8), or null for genderless. */
  genderFemaleEighths: number | null
  isLegendary: boolean
  isMythical: boolean
  isBaby: boolean
  evolution: EvolutionNode
  cry: string | null
}

export interface MoveEntry {
  name: string
  type: string
  damageClass: string
  power: number | null
  accuracy: number | null
  pp: number | null
  /** Level learned, only for level-up moves. */
  level: number | null
  effect: string
}

export interface PokemonMoves {
  versionGroup: string
  levelUp: MoveEntry[]
  /** TM / tutor / egg moves: names only to keep the payload light. */
  other: { name: string, method: string }[]
}
