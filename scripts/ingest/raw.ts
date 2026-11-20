/**
 * Shapes of the PokeAPI resources we read (as published in PokeAPI/api-data).
 * Only the fields we use are declared, so upstream additions cannot break the build.
 */

export interface NamedRef {
  name: string
  url: string
}

export interface LangName {
  language: { name: string }
  name: string
}

export interface LangText {
  language: { name: string }
  /** `flavor_text` for most resources, `text` for items. */
  flavor_text?: string
  text?: string
  version?: { name: string }
  version_group?: { name: string }
}

export interface LangEffect {
  language: { name: string }
  effect: string
  short_effect: string
}

export interface RawSpecies {
  id: number
  name: string
  names: LangName[]
  genera: { genus: string, language: { name: string } }[]
  generation: NamedRef
  color: NamedRef | null
  shape: NamedRef | null
  habitat: NamedRef | null
  egg_groups: NamedRef[]
  growth_rate: NamedRef | null
  capture_rate: number | null
  base_happiness: number | null
  hatch_counter: number | null
  gender_rate: number
  is_legendary: boolean
  is_mythical: boolean
  is_baby: boolean
  has_gender_differences: boolean
  pokedex_numbers: { entry_number: number, pokedex: NamedRef }[]
  flavor_text_entries: LangText[]
  evolution_chain: { url: string }
  varieties: { is_default: boolean, pokemon: NamedRef }[]
}

export interface RawStat {
  base_stat: number
  effort: number
  stat: NamedRef
}

export interface RawFormAbility {
  ability: NamedRef
  is_hidden: boolean
}

export interface RawPokemon {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number | null
  is_default: boolean
  species: NamedRef
  forms: NamedRef[]
  types: { slot: number, type: NamedRef }[]
  stats: RawStat[]
  abilities: RawFormAbility[]
  held_items: { item: NamedRef, version_details: { rarity: number, version: NamedRef }[] }[]
  past_types?: { generation: NamedRef, types: { slot: number, type: NamedRef }[] }[]
  past_stats?: { generation: NamedRef, stats: RawStat[] }[]
  past_abilities?: { generation: NamedRef, abilities: { ability: NamedRef | null, is_hidden: boolean }[] }[]
  moves: {
    move: NamedRef
    version_group_details: { level_learned_at: number, move_learn_method: NamedRef, version_group: NamedRef }[]
  }[]
  cries?: { latest?: string | null, legacy?: string | null }
}

export interface RawPokemonForm {
  id: number
  name: string
  form_name: string
  is_battle_only: boolean
  is_mega: boolean
  names: LangName[]
  form_names: LangName[]
}

export interface RawEvolutionDetail {
  trigger: NamedRef | null
  min_level: number | null
  item: NamedRef | null
  held_item: NamedRef | null
  known_move: NamedRef | null
  known_move_type: NamedRef | null
  min_happiness: number | null
  min_affection: number | null
  min_beauty: number | null
  time_of_day: string
  location: NamedRef | null
  gender: number | null
  needs_overworld_rain: boolean
  party_species: NamedRef | null
  party_type: NamedRef | null
  relative_physical_stats: number | null
  trade_species: NamedRef | null
  turn_upside_down: boolean
}

export interface RawEvolutionNode {
  species: NamedRef
  evolution_details: RawEvolutionDetail[]
  evolves_to: RawEvolutionNode[]
}

export interface RawEvolutionChain {
  chain: RawEvolutionNode
}

export interface RawMove {
  id: number
  name: string
  names: LangName[]
  accuracy: number | null
  pp: number | null
  power: number | null
  priority: number
  effect_chance: number | null
  damage_class: NamedRef
  generation: NamedRef
  target: NamedRef
  type: NamedRef
  contest_type: NamedRef | null
  meta: {
    ailment: NamedRef | null
    ailment_chance: number
    category: NamedRef | null
    crit_rate: number
    drain: number
    flinch_chance: number
    healing: number
    max_hits: number | null
    max_turns: number | null
    min_hits: number | null
    min_turns: number | null
    stat_chance: number
  } | null
  stat_changes: { change: number, stat: NamedRef }[]
  machines: { machine: { url: string }, version_group: NamedRef }[]
  effect_entries: LangEffect[]
  flavor_text_entries: LangText[]
  learned_by_pokemon: NamedRef[]
}

export interface RawMachine {
  id: number
  item: NamedRef
  move: NamedRef
  version_group: NamedRef
}

export interface RawAbility {
  id: number
  name: string
  names: LangName[]
  generation: NamedRef
  effect_entries: LangEffect[]
  flavor_text_entries: LangText[]
  pokemon: { is_hidden: boolean, pokemon: NamedRef }[]
}

export interface RawItem {
  id: number
  name: string
  names: LangName[]
  cost: number
  fling_power: number | null
  fling_effect: NamedRef | null
  attributes: NamedRef[]
  category: NamedRef
  effect_entries: LangEffect[]
  flavor_text_entries: LangText[]
  held_by_pokemon: { pokemon: NamedRef, version_details: { rarity: number, version: NamedRef }[] }[]
  machines: { machine: { url: string }, version_group: NamedRef }[]
}

export interface RawItemCategory {
  name: string
  pocket: NamedRef
}

export interface RawBerry {
  id: number
  name: string
  growth_time: number | null
  max_harvest: number | null
  natural_gift_power: number | null
  natural_gift_type: NamedRef | null
  size: number | null
  smoothness: number | null
  soil_dryness: number | null
  firmness: NamedRef | null
  flavors: { potency: number, flavor: NamedRef }[]
  item: NamedRef
}

export interface RawType {
  id: number
  name: string
  names: LangName[]
  generation: NamedRef
  move_damage_class: NamedRef | null
  damage_relations: Record<
    'double_damage_to' | 'half_damage_to' | 'no_damage_to' | 'double_damage_from' | 'half_damage_from' | 'no_damage_from',
    NamedRef[]
  >
  pokemon: { slot: number, pokemon: NamedRef }[]
  moves: NamedRef[]
}

export interface RawNature {
  id: number
  name: string
  names: LangName[]
  increased_stat: NamedRef | null
  decreased_stat: NamedRef | null
  likes_flavor: NamedRef | null
  hates_flavor: NamedRef | null
}

export interface RawLocation {
  id: number
  name: string
  names: LangName[]
  region: NamedRef | null
  areas: NamedRef[]
}

export interface RawEncounterDetail {
  min_level: number
  max_level: number
  chance: number
  method: NamedRef
  condition_values: NamedRef[]
}

export interface RawLocationArea {
  id: number
  name: string
  names: LangName[]
  location: NamedRef
  pokemon_encounters: {
    pokemon: NamedRef
    version_details: { version: NamedRef, max_chance: number, encounter_details: RawEncounterDetail[] }[]
  }[]
}

export interface RawPokemonEncounter {
  location_area: NamedRef
  version_details: { version: NamedRef, max_chance: number, encounter_details: RawEncounterDetail[] }[]
}

export interface RawRegion {
  id: number
  name: string
  names: LangName[]
  main_generation: NamedRef | null
  locations: NamedRef[]
  pokedexes: NamedRef[]
  version_groups: NamedRef[]
}

export interface RawGeneration {
  id: number
  name: string
  names: LangName[]
  main_region: NamedRef | null
  version_groups: NamedRef[]
  pokemon_species: NamedRef[]
  moves: NamedRef[]
  abilities: NamedRef[]
  types: NamedRef[]
}

export interface RawVersion {
  id: number
  name: string
  names: LangName[]
  version_group: NamedRef
}

export interface RawVersionGroup {
  id: number
  name: string
  order: number
  generation: NamedRef
  versions: NamedRef[]
  regions: NamedRef[]
  pokedexes: NamedRef[]
}

export interface RawPokedex {
  id: number
  name: string
  names: LangName[]
  descriptions: { description: string, language: { name: string } }[]
  is_main_series: boolean
  region: NamedRef | null
  pokemon_entries: { entry_number: number, pokemon_species: NamedRef }[]
}

export interface RawGrowthRate {
  name: string
  formula: string
  levels: { level: number, experience: number }[]
}

export interface RawEggGroup {
  name: string
  names: LangName[]
  pokemon_species: NamedRef[]
}

/** Any resource that is just a slug plus localized names (colors, shapes, habitats, ...). */
export interface RawNamed {
  name: string
  names: LangName[]
}
