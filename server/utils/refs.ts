import type {
  EntityByKind,
  EntityKind,
  EvolutionNode,
  Refs,
  TaxonomyKind,
} from '#shared/types/encyclopedia'
import type { Lookup } from '#server/utils/store'
import { battleMovesOf } from '#shared/utils/battle-moves'

/** Gathers what an entity mentions, then resolves it to rows and names in one go. */
class Collector {
  private readonly pokemon = new Set<number>()
  private readonly moves = new Set<string>()
  private readonly abilities = new Set<string>()
  private readonly items = new Set<string>()
  private readonly locations = new Set<string>()
  private readonly taxonomy = new Map<TaxonomyKind, Set<string>>()

  constructor(private readonly lookup: Lookup) {}

  pokemonIds(ids: Iterable<number>) { for (const id of ids) this.pokemon.add(id) }
  pokemonSlug(slug: string | null | undefined) {
    const entry = slug ? this.lookup.pokemonBySlug.get(slug) : undefined
    if (entry) this.pokemon.add(entry.id)
  }
  move(slug: string | null | undefined) { if (slug) this.moves.add(slug) }
  ability(slug: string | null | undefined) { if (slug) this.abilities.add(slug) }
  item(slug: string | null | undefined) { if (slug) this.items.add(slug) }
  location(slug: string | null | undefined) { if (slug) this.locations.add(slug) }
  tax(kind: TaxonomyKind, slug: string | null | undefined) {
    if (!slug) return
    const slugs = this.taxonomy.get(kind) ?? new Set<string>()
    slugs.add(slug)
    this.taxonomy.set(kind, slugs)
  }

  build(): Refs {
    // Move rows are shown with their class (physical, special, status), so label it too.
    for (const slug of this.moves) this.tax('damage-class', this.lookup.moves.get(slug)?.damageClass)

    const pick = <K, V>(keys: Set<K>, source: Map<K, V>): Record<string, V> => {
      const result: Record<string, V> = {}
      for (const key of keys) {
        const value = source.get(key)
        if (value !== undefined) result[String(key)] = value
      }
      return result
    }

    const taxonomy: Refs['taxonomy'] = {}
    for (const [kind, slugs] of this.taxonomy) {
      const table = this.lookup.taxonomy[kind]
      const picked: Record<string, (typeof table)[string]> = {}
      // Walk the table, not the mentions: tables list versions in release order, and pages rely on that.
      for (const [slug, names] of Object.entries(table)) {
        if (slugs.has(slug)) picked[slug] = names
      }
      taxonomy[kind] = picked
    }

    return {
      pokemon: pick(this.pokemon, this.lookup.pokemon),
      moves: pick(this.moves, this.lookup.moves),
      abilities: pick(this.abilities, this.lookup.abilities),
      items: pick(this.items, this.lookup.items),
      locations: pick(this.locations, this.lookup.locations),
      taxonomy,
    }
  }
}

function collectEvolution(node: EvolutionNode, c: Collector) {
  c.pokemonIds([node.id])
  for (const detail of node.details) {
    c.tax('evolution-trigger', detail.trigger)
    c.item(detail.item)
    c.item(detail.heldItem)
    c.move(detail.knownMove)
    c.tax('time-of-day', detail.timeOfDay)
    c.location(detail.location)
    c.pokemonSlug(detail.partySpecies)
    c.pokemonSlug(detail.tradeSpecies)
  }
  for (const next of node.evolvesTo) collectEvolution(next, c)
}

const collectors: { [K in EntityKind]: (entity: EntityByKind[K], c: Collector) => void } = {
  'pokemon': (species, c) => {
    // The previous and next Pokémon for the page's navigation buttons.
    c.pokemonIds([species.id - 1, species.id + 1])
    c.tax('color', species.color)
    c.tax('shape', species.shape)
    c.tax('habitat', species.habitat)
    c.tax('growth-rate', species.growthRate)
    for (const group of species.eggGroups) c.tax('egg-group', group)
    for (const form of species.forms) {
      for (const stat of form.stats) c.tax('stat', stat.key)
      for (const past of form.pastStats) for (const stat of past.stats) c.tax('stat', stat.key)
    }
    for (const entry of species.flavor) c.tax('version', entry.version)
    for (const number of species.pokedexNumbers) c.tax('pokedex', number.pokedex)
    collectEvolution(species.evolution, c)
    for (const form of species.forms) {
      for (const ability of form.abilities) c.ability(ability.slug)
      for (const past of form.pastAbilities) for (const ability of past.abilities) c.ability(ability.slug)
      for (const held of form.heldItems) {
        c.item(held.item)
        for (const version of Object.keys(held.rarity)) c.tax('version', version)
      }
    }
  },
  'moves': (move, c) => {
    c.tax('damage-class', move.damageClass)
    c.tax('move-target', move.target)
    c.tax('move-ailment', move.meta?.ailment)
    c.tax('move-category', move.meta?.category)
    c.tax('contest-type', move.contestType)
    for (const change of move.statChanges) c.tax('stat', change.stat)
    for (const machine of move.machines) {
      c.item(machine.item)
      c.tax('version-group', machine.versionGroup)
    }
    for (const entry of move.flavor) c.tax('version-group', entry.versionGroup)
    c.pokemonIds(move.learnedBy)
    const battle = battleMovesOf(move)
    if (battle) {
      c.move(battle.z.slug)
      c.move(battle.max.slug)
    }
  },
  'abilities': (ability, c) => {
    c.pokemonIds(ability.pokemon.map(entry => entry.id))
    for (const entry of ability.flavor) c.tax('version-group', entry.versionGroup)
  },
  'items': (item, c) => {
    c.tax('item-category', item.category)
    c.tax('item-pocket', item.pocket)
    c.tax('fling-effect', item.flingEffect)
    for (const attribute of item.attributes) c.tax('item-attribute', attribute)
    c.pokemonIds(item.heldBy.map(entry => entry.id))
    for (const machine of item.machines) {
      c.move(machine.move)
      c.tax('version-group', machine.versionGroup)
    }
    for (const entry of item.flavor) c.tax('version-group', entry.versionGroup)
    if (item.berry) {
      c.tax('berry-firmness', item.berry.firmness)
      for (const flavor of item.berry.flavors) c.tax('flavor', flavor.flavor)
    }
  },
  'locations': (location, c) => {
    c.tax('region', location.region)
    for (const area of location.areas) {
      for (const encounter of area.encounters) {
        c.pokemonIds([encounter.pokemon])
        c.tax('encounter-method', encounter.method)
        for (const version of encounter.versions) c.tax('version', version)
        for (const condition of encounter.conditions) c.tax('encounter-condition', condition)
      }
    }
  },
  'types': (type, c) => {
    c.tax('damage-class', type.damageClass)
    for (const move of type.moves) c.move(move)
    c.pokemonIds(type.pokemon)
  },
  'generations': (generation, c) => {
    c.tax('region', generation.region)
    for (const group of generation.versionGroups) c.tax('version-group', group)
    c.pokemonIds(generation.species)
    for (const move of generation.moves) c.move(move)
    for (const ability of generation.abilities) c.ability(ability)
  },
  'games': (group, c) => {
    for (const version of group.versions) c.tax('version', version)
    for (const region of group.regions) c.tax('region', region)
    for (const pokedex of group.pokedexes) c.tax('pokedex', pokedex)
    for (const machine of group.machines) {
      c.item(machine.item)
      c.move(machine.move)
    }
  },
  'pokedexes': (pokedex, c) => {
    c.tax('pokedex', pokedex.slug)
    c.tax('region', pokedex.region)
    c.pokemonIds(pokedex.entries.map(entry => entry.id))
  },
  'regions': (region, c) => {
    for (const location of region.locations) c.location(location)
    for (const pokedex of region.pokedexes) c.tax('pokedex', pokedex)
    for (const group of region.versionGroups) c.tax('version-group', group)
  },
  'egg-groups': (group, c) => {
    c.pokemonIds(group.species)
  },
}

/** Resolve everything `entity` mentions into the small rows and names its page needs. */
export function collectRefs<K extends EntityKind>(kind: K, entity: EntityByKind[K], lookup: Lookup): Refs {
  const collector = new Collector(lookup)
  collectors[kind](entity, collector)
  return collector.build()
}
