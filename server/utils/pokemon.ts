import type { EvolutionNode, MoveEntry, PokemonAbility, PokemonDetail, PokemonMoves } from '#shared/types/pokedex'
import type {
  RawAbility,
  RawEvolutionChain,
  RawEvolutionDetail,
  RawEvolutionNode,
  RawMove,
  RawPokemon,
  RawSpecies,
} from '#server/types/pokeapi'
import { cacheOptions, cleanText, englishText, idFromUrl, mapLimit, pokeFetch, pokeFetchUrl } from '#server/utils/pokeapi'

const MAX_LEVEL_UP_MOVES = 40
const MAX_OTHER_MOVES = 60
const FLAVOR_ENTRIES = 4

const GENDER_FEMALE = 1
const GENDER_MALE = 2

function describeCondition(details: RawEvolutionDetail[]): string {
  const detail = details[0]
  if (!detail) return ''

  const parts: string[] = []
  if (detail.min_level) parts.push(`Lv. ${detail.min_level}`)
  if (detail.item) parts.push(titleCase(detail.item.name))
  if (detail.trigger?.name === 'trade') parts.push('Trade')
  if (detail.held_item) parts.push(`holding ${titleCase(detail.held_item.name)}`)
  if (detail.known_move) parts.push(`knowing ${titleCase(detail.known_move.name)}`)
  if (detail.known_move_type) parts.push(`knowing a ${titleCase(detail.known_move_type.name)} move`)
  if (detail.min_happiness) parts.push('high friendship')
  if (detail.min_affection) parts.push('high affection')
  if (detail.time_of_day) parts.push(`at ${detail.time_of_day}`)
  if (detail.location) parts.push(`at ${titleCase(detail.location.name)}`)
  if (detail.needs_overworld_rain) parts.push('in rain')
  if (detail.gender === GENDER_FEMALE) parts.push('female')
  if (detail.gender === GENDER_MALE) parts.push('male')

  if (parts.length === 0 && detail.trigger?.name) parts.push(titleCase(detail.trigger.name))
  return parts.join(', ')
}

function flattenEvolution(node: RawEvolutionNode): EvolutionNode {
  return {
    id: idFromUrl(node.species.url),
    name: node.species.name,
    condition: describeCondition(node.evolution_details),
    evolvesTo: node.evolves_to.map(flattenEvolution),
  }
}

const getAbility = defineCachedFunction(async (name: string): Promise<string> => {
  const ability = await pokeFetch<RawAbility>(`ability/${name}`)
  const short = englishText(ability.effect_entries)
  if (short) return cleanText(short.short_effect)

  // Newer abilities only ship flavor text; the last English entry is the most recent wording.
  const flavor = ability.flavor_text_entries.findLast(entry => entry.language.name === 'en')
  return flavor ? cleanText(flavor.flavor_text) : ''
}, { ...cacheOptions('ability'), getKey: (name: string) => name })

const getMove = defineCachedFunction(async (name: string): Promise<Omit<MoveEntry, 'level'>> => {
  const move = await pokeFetch<RawMove>(`move/${name}`)
  const effectEntry = englishText(move.effect_entries)
  const effect = effectEntry
    ? cleanText(effectEntry.short_effect).replace('$effect_chance', String(move.effect_chance ?? ''))
    : ''

  return {
    name: move.name,
    type: move.type.name,
    damageClass: move.damage_class.name,
    power: move.power,
    accuracy: move.accuracy,
    pp: move.pp,
    effect,
  }
}, { ...cacheOptions('move'), getKey: (name: string) => name })

export const getPokemonDetail = defineCachedFunction(async (id: number): Promise<PokemonDetail> => {
  const pokemon = await pokeFetch<RawPokemon>(`pokemon/${id}`)
  const species = await pokeFetchUrl<RawSpecies>(pokemon.species.url)
  const [chain, abilityEffects] = await Promise.all([
    pokeFetchUrl<RawEvolutionChain>(species.evolution_chain.url),
    mapLimit(pokemon.abilities, entry => getAbility(entry.ability.name)),
  ])

  const abilities: PokemonAbility[] = pokemon.abilities.map((entry, index) => ({
    name: entry.ability.name,
    hidden: entry.is_hidden,
    effect: abilityEffects[index] ?? '',
  }))

  // Re-printed entries repeat across versions: keep one per distinct text, newest version wins.
  const flavorTexts = new Map<string, string>()
  for (const entry of species.flavor_text_entries.filter(item => item.language.name === 'en')) {
    flavorTexts.set(cleanText(entry.flavor_text), entry.version.name)
  }
  const flavor = [...flavorTexts]
    .slice(-FLAVOR_ENTRIES)
    .reverse()
    .map(([text, version]) => ({ text, version }))

  const stats = pokemon.stats.map(entry => ({ key: entry.stat.name, value: entry.base_stat }))

  return {
    id: pokemon.id,
    name: pokemon.name,
    genus: englishText(species.genera)?.genus ?? '',
    types: pokemon.types.toSorted((a, b) => a.slot - b.slot).map(entry => entry.type.name),
    generation: idFromUrl(species.generation.url),
    heightM: pokemon.height / 10,
    weightKg: pokemon.weight / 10,
    baseExperience: pokemon.base_experience,
    stats,
    statTotal: stats.reduce((sum, stat) => sum + stat.value, 0),
    abilities,
    flavor,
    eggGroups: species.egg_groups.map(group => group.name),
    habitat: species.habitat?.name ?? null,
    growthRate: species.growth_rate?.name ?? null,
    captureRate: species.capture_rate ?? null,
    baseHappiness: species.base_happiness ?? null,
    genderFemaleEighths: species.gender_rate >= 0 ? species.gender_rate : null,
    isLegendary: species.is_legendary,
    isMythical: species.is_mythical,
    isBaby: species.is_baby,
    evolution: flattenEvolution(chain.chain),
    cry: pokemon.cries?.latest ?? null,
  }
}, { ...cacheOptions('pokemon-detail'), getKey: (id: number) => String(id) })

interface MoveLearn {
  name: string
  method: string
  level: number
  versionGroup: number
  versionGroupName: string
}

export const getPokemonMoves = defineCachedFunction(async (id: number): Promise<PokemonMoves> => {
  const pokemon = await pokeFetch<RawPokemon>(`pokemon/${id}`)

  const learns: MoveLearn[] = pokemon.moves.flatMap(entry =>
    entry.version_group_details.map(detail => ({
      name: entry.move.name,
      method: detail.move_learn_method.name,
      level: detail.level_learned_at,
      versionGroup: idFromUrl(detail.version_group.url),
      versionGroupName: detail.version_group.name,
    })),
  )

  // Version-group ids grow chronologically. Prefer the newest game that has level-up data:
  // brand-new games upstream often list only TM moves at first, which would leave the table empty.
  const newest = (candidates: MoveLearn[]) =>
    candidates.reduce<MoveLearn | null>((best, learn) => (!best || learn.versionGroup > best.versionGroup ? learn : best), null)
  const latest = newest(learns.filter(learn => learn.method === 'level-up')) ?? newest(learns)
  if (!latest) return { versionGroup: '', levelUp: [], other: [] }

  const current = learns.filter(learn => learn.versionGroup === latest.versionGroup)

  const levelUpLearns = current
    .filter(learn => learn.method === 'level-up')
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
    .slice(0, MAX_LEVEL_UP_MOVES)

  const levelUp = await mapLimit(levelUpLearns, async (learn) => {
    const move = await getMove(learn.name)
    return { ...move, level: learn.level }
  })

  const otherSeen = new Set<string>()
  const other = current
    .filter(learn => learn.method !== 'level-up' && !otherSeen.has(learn.name) && otherSeen.add(learn.name))
    .slice(0, MAX_OTHER_MOVES)
    .map(learn => ({ name: learn.name, method: learn.method }))

  return { versionGroup: latest.versionGroupName, levelUp, other }
}, { ...cacheOptions('pokemon-moves'), getKey: (id: number) => String(id) })
