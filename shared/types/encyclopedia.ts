/**
 * The encyclopedia data model.
 *
 * Produced at build time by `scripts/ingest` from PokeAPI's published data, consumed by the Nuxt app.
 * Every translatable string carries all shipped languages, so the UI picks one at render time and
 * falls back to English when a translation does not exist upstream (Japanese descriptions often don't).
 */

export type Locale = 'en' | 'ja'

/** A name in every shipped language. `en` always exists; the rest may be missing. */
export interface Names {
  en: string
  ja?: string
  /** Kana reading (ja-Hrkt), useful for search and furigana-style display. */
  jaKana?: string
  /** Romaji reading, for search. */
  jaRoma?: string
}

/** Descriptive text in every shipped language. Either may be missing. */
export interface Text {
  en?: string
  ja?: string
}

// ---------------------------------------------------------------------------
// Pokémon
// ---------------------------------------------------------------------------

export type FormKind =
  | 'default'
  | 'mega'
  | 'gmax'
  | 'primal'
  | 'ultra'
  | 'eternamax'
  | 'terastal'
  | 'crowned'
  | 'regional'
  | 'totem'
  /** A different Pokémon in practice (Origin, Therian, Attack...): types, stats or abilities differ. */
  | 'variant'
  /** Same battle data as the default; only the look differs. */
  | 'cosmetic'

export interface PokemonStat {
  key: string
  value: number
  /** EV yield: points gained when this Pokémon is defeated. */
  effort: number
}

export interface FormAbility {
  slug: string
  hidden: boolean
}

export interface HeldItem {
  item: string
  /** Version slug -> chance (percent) of holding it. */
  rarity: Record<string, number>
}

export interface PastTypes {
  /** Generation up to and including which these types applied. */
  untilGeneration: number
  types: string[]
}

export interface PastStats {
  untilGeneration: number
  stats: PokemonStat[]
}

export interface PastAbilities {
  untilGeneration: number
  abilities: FormAbility[]
}

export interface PokemonForm {
  /** PokeAPI Pokémon id (10034 for Mega Charizard X). Also keys the sprite files. */
  pokemonId: number
  slug: string
  /** URL segment (`mega-x`); null for the default form. */
  formSlug: string | null
  kind: FormKind
  /** Only exists inside a battle (Mega, Gigantamax, Primal...). */
  battleOnly: boolean
  /** Display name of the form (Mega Charizard X), when PokeAPI provides one. */
  names: Names | null
  /** Short form label, e.g. "Mega X". */
  formNames: Names | null
  types: string[]
  stats: PokemonStat[]
  statTotal: number
  heightM: number
  weightKg: number
  baseExperience: number | null
  abilities: FormAbility[]
  heldItems: HeldItem[]
  pastTypes: PastTypes[]
  pastStats: PastStats[]
  pastAbilities: PastAbilities[]
  cry: string | null
  cryLegacy: string | null
}

export interface EvolutionDetail {
  trigger: string
  minLevel: number | null
  item: string | null
  heldItem: string | null
  knownMove: string | null
  knownMoveType: string | null
  minHappiness: number | null
  minAffection: number | null
  minBeauty: number | null
  timeOfDay: string | null
  location: string | null
  gender: 'female' | 'male' | null
  needsOverworldRain: boolean
  partySpecies: string | null
  partyType: string | null
  relativePhysicalStats: number | null
  tradeSpecies: string | null
  turnUpsideDown: boolean
}

export interface EvolutionNode {
  /** Species id. */
  id: number
  slug: string
  /** Ways to reach this stage from the previous one (alternatives). Empty for the root. */
  details: EvolutionDetail[]
  evolvesTo: EvolutionNode[]
}

export interface FlavorEntry {
  version: string
  text: Text
}

export interface PokedexNumber {
  pokedex: string
  number: number
}

export interface SpeciesEntry {
  id: number
  slug: string
  names: Names
  genus: Text
  generation: number
  color: string | null
  shape: string | null
  habitat: string | null
  eggGroups: string[]
  growthRate: string | null
  captureRate: number | null
  baseHappiness: number | null
  hatchCounter: number | null
  genderFemaleEighths: number | null
  isLegendary: boolean
  isMythical: boolean
  isBaby: boolean
  hasGenderDifferences: boolean
  pokedexNumbers: PokedexNumber[]
  flavor: FlavorEntry[]
  evolution: EvolutionNode
  forms: PokemonForm[]
}

/** One row of the Pokédex grid and every picker. Kept small: it ships to every page. */
export interface DexEntry {
  id: number
  slug: string
  names: Names
  types: string[]
  gen: number
}

/** A wider row for advanced filtering and comparison. Loaded only by the pages that need it. */
export interface PokemonRow extends DexEntry {
  stats: number[]
  statTotal: number
  abilities: string[]
  color: string | null
  shape: string | null
  habitat: string | null
  eggGroups: string[]
  growthRate: string | null
  isLegendary: boolean
  isMythical: boolean
  isBaby: boolean
  formCount: number
}

// ---------------------------------------------------------------------------
// Learnsets and encounters (loaded on demand per Pokémon)
// ---------------------------------------------------------------------------

/** `[versionGroupIndex, methodIndex, level]` into `Learnset.versionGroups` and `Learnset.methods`. */
export type LearnTuple = [number, number, number]

export interface Learnset {
  versionGroups: string[]
  methods: string[]
  moves: { move: string, learns: LearnTuple[] }[]
}

export interface Encounter {
  location: string
  area: string
  versions: string[]
  method: string
  minLevel: number
  maxLevel: number
  chance: number
  conditions: string[]
}

// ---------------------------------------------------------------------------
// Moves, abilities, items
// ---------------------------------------------------------------------------

export interface MoveMeta {
  ailment: string | null
  ailmentChance: number
  category: string | null
  minHits: number | null
  maxHits: number | null
  minTurns: number | null
  maxTurns: number | null
  drain: number
  healing: number
  critRate: number
  flinchChance: number
  statChance: number
}

export interface MoveStatChange {
  stat: string
  change: number
}

export interface VersionGroupText {
  versionGroup: string
  text: Text
}

export interface MoveMachine {
  versionGroup: string
  /** TM or HM item slug, e.g. `tm24`. */
  item: string
}

export interface MoveEntry {
  id: number
  slug: string
  names: Names
  type: string
  damageClass: string
  power: number | null
  accuracy: number | null
  pp: number | null
  priority: number
  target: string
  generation: number
  effectChance: number | null
  effect: Text
  flavor: VersionGroupText[]
  meta: MoveMeta | null
  statChanges: MoveStatChange[]
  machines: MoveMachine[]
  contestType: string | null
  /** Species ids that can learn the move. */
  learnedBy: number[]
}

export interface MoveRow {
  id: number
  slug: string
  names: Names
  type: string
  damageClass: string
  power: number | null
  accuracy: number | null
  pp: number | null
  priority: number
  target: string
  generation: number
  ailment: string | null
}

export interface AbilityEntry {
  id: number
  slug: string
  names: Names
  generation: number
  effect: Text
  shortEffect: Text
  flavor: VersionGroupText[]
  /** Species ids, with whether it is their hidden ability. */
  pokemon: { id: number, hidden: boolean }[]
}

export interface AbilityRow {
  id: number
  slug: string
  names: Names
  generation: number
  shortEffect: Text
  pokemonCount: number
}

/** Newly added berries often have no data yet, so every measurement may be missing. */
export interface BerryData {
  growthTime: number | null
  maxHarvest: number | null
  naturalGiftPower: number | null
  naturalGiftType: string | null
  size: number | null
  smoothness: number | null
  soilDryness: number | null
  firmness: string | null
  /** Flavor -> potency. */
  flavors: { flavor: string, potency: number }[]
}

export interface ItemEntry {
  id: number
  slug: string
  names: Names
  category: string
  pocket: string | null
  cost: number
  flingPower: number | null
  flingEffect: string | null
  attributes: string[]
  effect: Text
  shortEffect: Text
  flavor: VersionGroupText[]
  /** Species ids that may hold it in the wild, with the best chance across versions. */
  heldBy: { id: number, chance: number }[]
  /** For TMs and HMs: the move it teaches, per version group. */
  machines: { versionGroup: string, move: string }[]
  berry: BerryData | null
}

export interface ItemRow {
  id: number
  slug: string
  names: Names
  category: string
  pocket: string | null
  cost: number
  shortEffect: Text
}

// ---------------------------------------------------------------------------
// Types, natures, world, games
// ---------------------------------------------------------------------------

export interface TypeRelations {
  doubleTo: string[]
  halfTo: string[]
  noTo: string[]
  doubleFrom: string[]
  halfFrom: string[]
  noFrom: string[]
}

export interface TypeEntry {
  id: number
  slug: string
  names: Names
  generation: number
  damageClass: string | null
  relations: TypeRelations
  /** Move slugs of this type. */
  moves: string[]
  /** Species ids having this type (any form). */
  pokemon: number[]
  /** True when at least one Pokémon has it; hidden from the chart otherwise (stellar, unknown...). */
  hasPokemon: boolean
}

export interface NatureEntry {
  id: number
  slug: string
  names: Names
  increasedStat: string | null
  decreasedStat: string | null
  likesFlavor: string | null
  hatesFlavor: string | null
}

export interface EncounterGroup {
  /** Species id. */
  pokemon: number
  versions: string[]
  method: string
  minLevel: number
  maxLevel: number
  chance: number
  conditions: string[]
}

export interface LocationArea {
  id: number
  slug: string
  names: Names
  encounters: EncounterGroup[]
}

export interface LocationEntry {
  id: number
  slug: string
  names: Names
  region: string | null
  areas: LocationArea[]
}

export interface LocationRow {
  id: number
  slug: string
  names: Names
  region: string | null
  areaCount: number
  encounterCount: number
}

export interface RegionEntry {
  id: number
  slug: string
  names: Names
  mainGeneration: number | null
  locations: string[]
  pokedexes: string[]
  versionGroups: string[]
}

export interface GenerationEntry {
  id: number
  slug: string
  names: Names
  region: string | null
  versionGroups: string[]
  species: number[]
  moves: string[]
  abilities: string[]
  types: string[]
}

export interface VersionEntry {
  slug: string
  names: Names
  versionGroup: string
}

export interface VersionGroupEntry {
  slug: string
  /** The games in the group joined, e.g. "Sword / Shield". */
  names: Names
  generation: number
  order: number
  versions: string[]
  regions: string[]
  pokedexes: string[]
  /** TM/HM numbers available in this game, with the move each teaches. */
  machines: { item: string, move: string }[]
}

export interface PokedexEntryRow {
  /** Species id. */
  id: number
  number: number
}

export interface PokedexEntry {
  id: number
  slug: string
  names: Names
  description: Text
  region: string | null
  mainSeries: boolean
  entries: PokedexEntryRow[]
}

export interface GrowthRateEntry {
  slug: string
  formula: string
  /** Experience needed to reach each level, index 0 = level 1. */
  experience: number[]
}

export interface EggGroupEntry {
  slug: string
  names: Names
  species: number[]
}

/** Small lookup tables (categories, habitats, targets...) merged with our own Japanese glossary. */
export type TaxonomyKind =
  | 'color'
  | 'shape'
  | 'habitat'
  | 'growth-rate'
  | 'egg-group'
  | 'damage-class'
  | 'move-target'
  | 'move-ailment'
  | 'move-category'
  | 'learn-method'
  | 'item-category'
  | 'item-pocket'
  | 'item-attribute'
  | 'fling-effect'
  | 'berry-firmness'
  | 'flavor'
  | 'stat'
  | 'encounter-method'
  | 'encounter-condition'
  | 'contest-type'
  | 'version'
  | 'version-group'
  | 'region'
  | 'pokedex'
  | 'time-of-day'
  | 'evolution-trigger'

export type Taxonomy = Record<TaxonomyKind, Record<string, Names>>

/** A compact row for the global search index. */
export interface SearchRow {
  /** Entity kind: pokemon, move, ability, item, location, nature, type... */
  k: string
  /** Slug (or numeric id for Pokémon) used in the URL. */
  s: string
  names: Names
}

export interface DataManifest {
  schema: number
  generatedAt: string
  sourceCommit: string
  counts: Record<string, number>
}

// ---------------------------------------------------------------------------
// Published, browser-side data
// ---------------------------------------------------------------------------

/** What the type chart and every type badge need; the heavy member lists stay on each type's page. */
export interface TypeRow {
  slug: string
  names: Names
  relations: TypeRelations
  /** True when at least one Pokémon has it; hidden from the chart otherwise (stellar, unknown...). */
  hasPokemon: boolean
}

/** Small reference collections loaded together by pages that need game and region context. */
export interface ReferenceData {
  generations: { id: number, slug: string, names: Names, region: string | null }[]
  versions: VersionEntry[]
  versionGroups: { slug: string, names: Names, generation: number, order: number, versions: string[] }[]
  regions: { slug: string, names: Names }[]
  pokedexes: { slug: string, names: Names, region: string | null, mainSeries: boolean, count: number }[]
  growthRates: GrowthRateEntry[]
  eggGroups: { slug: string, names: Names, count: number }[]
  natures: NatureEntry[]
}
