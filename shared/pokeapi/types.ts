/**
 * Shapes of the PokeAPI responses we read. Only the fields Bokedex uses are declared,
 * so a field PokeAPI adds later cannot break us and a field we rely on cannot vanish unnoticed.
 */

export interface NamedRef {
  name: string
  url: string
}

export interface ApiList {
  count: number
  results: NamedRef[]
}

export interface Localized {
  language: { name: string }
}

export type DamageRelationKey =
  | 'double_damage_to'
  | 'half_damage_to'
  | 'no_damage_to'
  | 'double_damage_from'
  | 'half_damage_from'
  | 'no_damage_from'

export interface RawType {
  name: string
  damage_relations: Record<DamageRelationKey, { name: string }[]>
  pokemon: { slot: number, pokemon: { url: string } }[]
}

export interface RawGeneration {
  name: string
  main_region: { name: string } | null
  pokemon_species: { url: string }[]
}

export interface RawEvolutionDetail {
  min_level: number | null
  item: NamedRef | null
  trigger: NamedRef | null
  held_item: NamedRef | null
  known_move: NamedRef | null
  known_move_type: NamedRef | null
  min_happiness: number | null
  min_affection: number | null
  time_of_day: string
  location: NamedRef | null
  needs_overworld_rain: boolean
  /** 1 = female, 2 = male. */
  gender: number | null
}

export interface RawEvolutionNode {
  species: NamedRef
  evolution_details: RawEvolutionDetail[]
  evolves_to: RawEvolutionNode[]
}

export interface RawEvolutionChain {
  chain: RawEvolutionNode
}

export interface RawPokemon {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number | null
  species: NamedRef
  types: { slot: number, type: NamedRef }[]
  stats: { base_stat: number, stat: NamedRef }[]
  abilities: { is_hidden: boolean, ability: NamedRef }[]
  moves: {
    move: NamedRef
    version_group_details: {
      level_learned_at: number
      move_learn_method: NamedRef
      version_group: NamedRef
    }[]
  }[]
  cries?: { latest?: string | null }
}

export interface RawSpecies {
  generation: NamedRef
  evolution_chain: { url: string }
  flavor_text_entries: (Localized & { flavor_text: string, version: NamedRef })[]
  genera: (Localized & { genus: string })[]
  egg_groups: NamedRef[]
  habitat: NamedRef | null
  growth_rate: NamedRef | null
  capture_rate: number | null
  base_happiness: number | null
  /** Female share in eighths, or -1 for genderless. */
  gender_rate: number
  is_legendary: boolean
  is_mythical: boolean
  is_baby: boolean
}

export interface RawAbility {
  effect_entries: (Localized & { short_effect: string })[]
  flavor_text_entries: (Localized & { flavor_text: string })[]
}

export interface RawMove {
  name: string
  type: NamedRef
  damage_class: NamedRef
  power: number | null
  accuracy: number | null
  pp: number | null
  effect_chance: number | null
  effect_entries: (Localized & { short_effect: string })[]
}
