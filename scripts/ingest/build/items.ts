import type { AbilityEntry, AbilityRow, BerryData, BerryRow, ItemEntry, ItemRow } from '#shared/types/encyclopedia'
import { effectOf, flavorBy, names } from '#ingest/l10n'
import type { Machine } from '#ingest/build/moves'
import type { RawAbility, RawBerry, RawItem, RawItemCategory } from '#ingest/raw'
import { idFromUrl, ids, read, readAll } from '#ingest/source'

export interface AbilitiesBuild {
  entries: AbilityEntry[]
  rows: AbilityRow[]
}

export interface ItemsBuild {
  entries: ItemEntry[]
  rows: ItemRow[]
  berries: BerryRow[]
}

export function buildAbilities(speciesByPokemonId: Map<number, number>): AbilitiesBuild {
  const entries: AbilityEntry[] = ids('ability').map((id) => {
    const raw = read<RawAbility>(`ability/${id}`)

    // A species can appear through several forms; the ability is "hidden" only if it is hidden in all of them.
    const bySpecies = new Map<number, boolean>()
    for (const entry of raw.pokemon) {
      const species = speciesByPokemonId.get(idFromUrl(entry.pokemon.url))
      if (species === undefined) continue
      bySpecies.set(species, (bySpecies.get(species) ?? true) && entry.is_hidden)
    }

    return {
      id,
      slug: raw.name,
      names: names(raw.names, raw.name),
      generation: idFromUrl(raw.generation.url),
      effect: effectOf(raw.effect_entries, 'effect'),
      shortEffect: effectOf(raw.effect_entries, 'short_effect'),
      flavor: flavorBy(raw.flavor_text_entries, 'version_group').map(entry => ({ versionGroup: entry.key, text: entry.text })),
      pokemon: [...bySpecies].map(([speciesId, hidden]) => ({ id: speciesId, hidden })).sort((a, b) => a.id - b.id),
    }
  })

  const rows: AbilityRow[] = entries.map(ability => ({
    id: ability.id,
    slug: ability.slug,
    names: ability.names,
    generation: ability.generation,
    shortEffect: ability.shortEffect,
    pokemonCount: ability.pokemon.length,
  }))

  return { entries, rows }
}

function readBerries(): Map<string, BerryData> {
  return new Map(
    readAll<RawBerry>('berry').map(raw => [
      raw.item.name,
      {
        growthTime: raw.growth_time,
        maxHarvest: raw.max_harvest,
        naturalGiftPower: raw.natural_gift_power,
        naturalGiftType: raw.natural_gift_type?.name ?? null,
        size: raw.size,
        smoothness: raw.smoothness,
        soilDryness: raw.soil_dryness,
        firmness: raw.firmness?.name ?? null,
        flavors: raw.flavors.filter(flavor => flavor.potency > 0).map(flavor => ({ flavor: flavor.flavor.name, potency: flavor.potency })),
      },
    ]),
  )
}

export function buildItems(speciesByPokemonId: Map<number, number>, machines: Map<number, Machine>): ItemsBuild {
  const berries = readBerries()
  const pockets = new Map(
    readAll<RawItemCategory>('item-category').map(category => [category.name, category.pocket.name]),
  )

  const entries: ItemEntry[] = ids('item').map((id) => {
    const raw = read<RawItem>(`item/${id}`)

    const heldBy = new Map<number, number>()
    for (const entry of raw.held_by_pokemon) {
      const species = speciesByPokemonId.get(idFromUrl(entry.pokemon.url))
      if (species === undefined) continue
      const best = Math.max(...entry.version_details.map(detail => detail.rarity))
      heldBy.set(species, Math.max(heldBy.get(species) ?? 0, best))
    }

    return {
      id,
      slug: raw.name,
      names: names(raw.names, raw.name),
      category: raw.category.name,
      pocket: pockets.get(raw.category.name) ?? null,
      cost: raw.cost,
      flingPower: raw.fling_power,
      flingEffect: raw.fling_effect?.name ?? null,
      attributes: raw.attributes.map(attribute => attribute.name),
      effect: effectOf(raw.effect_entries, 'effect'),
      shortEffect: effectOf(raw.effect_entries, 'short_effect'),
      flavor: flavorBy(raw.flavor_text_entries, 'version_group').map(entry => ({ versionGroup: entry.key, text: entry.text })),
      heldBy: [...heldBy].map(([speciesId, chance]) => ({ id: speciesId, chance })).sort((a, b) => b.chance - a.chance || a.id - b.id),
      machines: raw.machines.flatMap((entry) => {
        const machine = machines.get(idFromUrl(entry.machine.url))
        return machine ? [{ versionGroup: machine.versionGroup, move: machine.move }] : []
      }),
      berry: berries.get(raw.name) ?? null,
    }
  })

  const rows: ItemRow[] = entries.map(item => ({
    id: item.id,
    slug: item.slug,
    names: item.names,
    category: item.category,
    pocket: item.pocket,
    cost: item.cost,
    shortEffect: item.shortEffect,
  }))

  const berryRows: BerryRow[] = entries.flatMap(item => (item.berry ? [{ slug: item.slug, names: item.names, ...item.berry }] : []))

  return { entries, rows, berries: berryRows }
}
