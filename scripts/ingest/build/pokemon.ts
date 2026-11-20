import type {
  DexEntry,
  Encounter,
  EvolutionDetail,
  EvolutionNode,
  FormAbility,
  FormKind,
  Learnset,
  PastAbilities,
  PastStats,
  PastTypes,
  PokemonForm,
  PokemonRow,
  PokemonStat,
  SpeciesEntry,
} from '#shared/types/encyclopedia'
import { flavorBy, names, textOf } from '#ingest/l10n'
import type {
  RawEvolutionChain,
  RawEvolutionDetail,
  RawEvolutionNode,
  RawPokemon,
  RawPokemonEncounter,
  RawPokemonForm,
  RawSpecies,
  RawStat,
} from '#ingest/raw'
import { exists, idFromUrl, ids, read } from '#ingest/source'

export interface AreaRef {
  location: string
  area: string
}

export interface PokemonBuild {
  species: SpeciesEntry[]
  dex: DexEntry[]
  rows: PokemonRow[]
  learnsets: Map<number, Learnset>
  encounters: Map<number, Encounter[]>
  /** Any Pokémon id (including forms) -> its species id. */
  speciesByPokemonId: Map<number, number>
}

const FEMALE = 1
const MALE = 2

const HYPHEN_FORMS: [RegExp, FormKind][] = [
  [/cap$/, 'cosmetic'],
  [/totem/, 'totem'],
  [/^mega(-[xyz])?$/, 'mega'],
  [/^gmax$/, 'gmax'],
  [/^primal$/, 'primal'],
  [/^ultra$/, 'ultra'],
  [/^eternamax$/, 'eternamax'],
  [/terastal|stellar/, 'terastal'],
  [/^crowned/, 'crowned'],
  [/^(alola|galar|hisui|paldea)/, 'regional'],
]

function formSlugOf(speciesSlug: string, slug: string, isDefault: boolean): string | null {
  if (isDefault) return null
  return slug.startsWith(`${speciesSlug}-`) ? slug.slice(speciesSlug.length + 1) : slug
}

const statsOf = (stats: RawStat[]): PokemonStat[] =>
  stats.map(stat => ({ key: stat.stat.name, value: stat.base_stat, effort: stat.effort }))

const typesOf = (types: RawPokemon['types']) => types.toSorted((a, b) => a.slot - b.slot).map(entry => entry.type.name)

const abilitiesOf = (abilities: RawPokemon['abilities']): FormAbility[] =>
  abilities.map(entry => ({ slug: entry.ability.name, hidden: entry.is_hidden }))

const sameBattleData = (a: PokemonForm, b: PokemonForm) =>
  a.types.join() === b.types.join()
  && a.stats.map(stat => stat.value).join() === b.stats.map(stat => stat.value).join()
  && a.abilities.map(ability => ability.slug).join() === b.abilities.map(ability => ability.slug).join()

function pastTypesOf(raw: RawPokemon): PastTypes[] {
  return (raw.past_types ?? []).map(entry => ({ untilGeneration: idFromUrl(entry.generation.url), types: typesOf(entry.types) }))
}

function pastStatsOf(raw: RawPokemon): PastStats[] {
  return (raw.past_stats ?? []).map(entry => ({ untilGeneration: idFromUrl(entry.generation.url), stats: statsOf(entry.stats) }))
}

function pastAbilitiesOf(raw: RawPokemon): PastAbilities[] {
  return (raw.past_abilities ?? []).map(entry => ({
    untilGeneration: idFromUrl(entry.generation.url),
    abilities: entry.abilities.flatMap(item => (item.ability ? [{ slug: item.ability.name, hidden: item.is_hidden }] : [])),
  }))
}

function buildForm(raw: RawPokemon, speciesSlug: string): PokemonForm {
  const formSlug = formSlugOf(speciesSlug, raw.name, raw.is_default)
  const formId = raw.forms[0] ? idFromUrl(raw.forms[0].url) : null
  const formInfo = formId !== null && exists(`pokemon-form/${formId}`) ? read<RawPokemonForm>(`pokemon-form/${formId}`) : null
  const formNames = formInfo?.names.length ? names(formInfo.names, formSlug ?? raw.name) : null
  const shortNames = formInfo?.form_names.length ? names(formInfo.form_names, formSlug ?? raw.name) : null

  const stats = statsOf(raw.stats)
  return {
    pokemonId: raw.id,
    slug: raw.name,
    formSlug,
    kind: 'default',
    battleOnly: formInfo?.is_battle_only ?? false,
    names: formNames,
    formNames: shortNames,
    types: typesOf(raw.types),
    stats,
    statTotal: stats.reduce((sum, stat) => sum + stat.value, 0),
    heightM: raw.height / 10,
    weightKg: raw.weight / 10,
    baseExperience: raw.base_experience,
    abilities: abilitiesOf(raw.abilities),
    heldItems: raw.held_items.map(held => ({
      item: held.item.name,
      rarity: Object.fromEntries(held.version_details.map(detail => [detail.version.name, detail.rarity])),
    })),
    pastTypes: pastTypesOf(raw),
    pastStats: pastStatsOf(raw),
    pastAbilities: pastAbilitiesOf(raw),
    cry: raw.cries?.latest ?? null,
    cryLegacy: raw.cries?.legacy ?? null,
  }
}

/** Decide what kind of form this is; same-battle-data forms with no known mechanic are cosmetic. */
function classify(form: PokemonForm, base: PokemonForm): FormKind {
  if (form.formSlug === null) return 'default'
  const known = HYPHEN_FORMS.find(([pattern]) => pattern.test(form.formSlug as string))
  if (known) return known[1]
  return sameBattleData(form, base) ? 'cosmetic' : 'variant'
}

function evolutionDetail(raw: RawEvolutionDetail): EvolutionDetail {
  return {
    trigger: raw.trigger?.name ?? 'other',
    minLevel: raw.min_level,
    item: raw.item?.name ?? null,
    heldItem: raw.held_item?.name ?? null,
    knownMove: raw.known_move?.name ?? null,
    knownMoveType: raw.known_move_type?.name ?? null,
    minHappiness: raw.min_happiness,
    minAffection: raw.min_affection,
    minBeauty: raw.min_beauty,
    timeOfDay: raw.time_of_day || null,
    location: raw.location?.name ?? null,
    gender: raw.gender === FEMALE ? 'female' : raw.gender === MALE ? 'male' : null,
    needsOverworldRain: raw.needs_overworld_rain,
    partySpecies: raw.party_species?.name ?? null,
    partyType: raw.party_type?.name ?? null,
    relativePhysicalStats: raw.relative_physical_stats,
    tradeSpecies: raw.trade_species?.name ?? null,
    turnUpsideDown: raw.turn_upside_down,
  }
}

function evolutionNode(node: RawEvolutionNode): EvolutionNode {
  return {
    id: idFromUrl(node.species.url),
    slug: node.species.name,
    details: node.evolution_details.map(evolutionDetail),
    evolvesTo: node.evolves_to.map(evolutionNode),
  }
}

function buildLearnset(raw: RawPokemon, versionGroupOrder: Map<string, number>): Learnset {
  const used = new Set<string>()
  const methods = new Set<string>()
  for (const entry of raw.moves) {
    for (const detail of entry.version_group_details) {
      used.add(detail.version_group.name)
      methods.add(detail.move_learn_method.name)
    }
  }
  const versionGroups = [...used].sort((a, b) => (versionGroupOrder.get(a) ?? 0) - (versionGroupOrder.get(b) ?? 0))
  const methodList = [...methods].sort()

  return {
    versionGroups,
    methods: methodList,
    moves: raw.moves.map(entry => ({
      move: entry.move.name,
      learns: entry.version_group_details
        .map(detail => [
          versionGroups.indexOf(detail.version_group.name),
          methodList.indexOf(detail.move_learn_method.name),
          detail.level_learned_at,
        ] as [number, number, number])
        .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]),
    })),
  }
}

/** Wild encounters for one Pokémon, merging versions that share the same spot, method, levels and chance. */
function buildEncounters(pokemonId: number, areas: Map<number, AreaRef>): Encounter[] {
  if (!exists(`pokemon/${pokemonId}/encounters`)) return []
  const merged = new Map<string, Encounter>()

  for (const entry of read<RawPokemonEncounter[]>(`pokemon/${pokemonId}/encounters`)) {
    const ref = areas.get(idFromUrl(entry.location_area.url))
    if (!ref) continue
    for (const version of entry.version_details) {
      for (const detail of version.encounter_details) {
        const conditions = detail.condition_values.map(value => value.name).sort()
        const key = [ref.area, detail.method.name, detail.min_level, detail.max_level, detail.chance, conditions.join('+')].join('|')
        const existing = merged.get(key)
        if (existing) existing.versions.push(version.version.name)
        else {
          merged.set(key, {
            location: ref.location,
            area: ref.area,
            versions: [version.version.name],
            method: detail.method.name,
            minLevel: detail.min_level,
            maxLevel: detail.max_level,
            chance: detail.chance,
            conditions,
          })
        }
      }
    }
  }
  return [...merged.values()]
}

function toRow(species: SpeciesEntry): PokemonRow {
  const base = species.forms.find(form => form.kind === 'default') ?? species.forms[0]
  if (!base) throw new Error(`Species ${species.slug} has no forms`)
  return {
    id: species.id,
    slug: species.slug,
    names: species.names,
    types: base.types,
    gen: species.generation,
    stats: base.stats.map(stat => stat.value),
    statTotal: base.statTotal,
    abilities: base.abilities.map(ability => ability.slug),
    color: species.color,
    shape: species.shape,
    habitat: species.habitat,
    eggGroups: species.eggGroups,
    growthRate: species.growthRate,
    isLegendary: species.isLegendary,
    isMythical: species.isMythical,
    isBaby: species.isBaby,
    formCount: species.forms.length,
  }
}

export function buildPokemon(versionGroupOrder: Map<string, number>, areas: Map<number, AreaRef>): PokemonBuild {
  const species: SpeciesEntry[] = []
  const learnsets = new Map<number, Learnset>()
  const encounters = new Map<number, Encounter[]>()
  const speciesByPokemonId = new Map<number, number>()
  const chains = new Map<number, EvolutionNode>()

  for (const speciesId of ids('pokemon-species')) {
    const raw = read<RawSpecies>(`pokemon-species/${speciesId}`)
    const rawForms = raw.varieties
      .map(variety => read<RawPokemon>(`pokemon/${idFromUrl(variety.pokemon.url)}`))
      .sort((a, b) => Number(b.is_default) - Number(a.is_default) || a.id - b.id)

    const forms = rawForms.map(form => buildForm(form, raw.name))
    const base = forms[0]
    if (!base) continue
    for (const form of forms) form.kind = classify(form, base)

    for (const form of rawForms) {
      speciesByPokemonId.set(form.id, speciesId)
      learnsets.set(form.id, buildLearnset(form, versionGroupOrder))
      const found = buildEncounters(form.id, areas)
      if (found.length) encounters.set(form.id, found)
    }

    const chainId = idFromUrl(raw.evolution_chain.url)
    const evolution = chains.get(chainId) ?? evolutionNode(read<RawEvolutionChain>(`evolution-chain/${chainId}`).chain)
    chains.set(chainId, evolution)

    species.push({
      id: speciesId,
      slug: raw.name,
      names: names(raw.names, raw.name),
      genus: textOfGenera(raw.genera),
      generation: idFromUrl(raw.generation.url),
      color: raw.color?.name ?? null,
      shape: raw.shape?.name ?? null,
      habitat: raw.habitat?.name ?? null,
      eggGroups: raw.egg_groups.map(group => group.name),
      growthRate: raw.growth_rate?.name ?? null,
      captureRate: raw.capture_rate,
      baseHappiness: raw.base_happiness,
      hatchCounter: raw.hatch_counter,
      genderFemaleEighths: raw.gender_rate >= 0 ? raw.gender_rate : null,
      isLegendary: raw.is_legendary,
      isMythical: raw.is_mythical,
      isBaby: raw.is_baby,
      hasGenderDifferences: raw.has_gender_differences,
      pokedexNumbers: raw.pokedex_numbers.map(entry => ({ pokedex: entry.pokedex.name, number: entry.entry_number })),
      flavor: flavorBy(raw.flavor_text_entries, 'version').map(entry => ({ version: entry.key, text: entry.text })),
      evolution,
      forms,
    })
  }

  const rows = species.map(toRow)
  const dex: DexEntry[] = rows.map(row => ({ id: row.id, slug: row.slug, names: row.names, types: row.types, gen: row.gen }))
  return { species, dex, rows, learnsets, encounters, speciesByPokemonId }
}

function textOfGenera(genera: RawSpecies['genera']) {
  return textOf(genera.map(entry => ({ language: entry.language, flavor_text: entry.genus })))
}
