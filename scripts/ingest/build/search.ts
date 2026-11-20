import type { ItemRow, LocationRow, MoveRow, NatureEntry, SearchRow, SpeciesEntry, TypeEntry } from '#shared/types/encyclopedia'

export interface SearchSources {
  species: SpeciesEntry[]
  moves: MoveRow[]
  abilities: { slug: string, names: SearchRow['names'] }[]
  items: ItemRow[]
  locations: LocationRow[]
  natures: NatureEntry[]
  types: TypeEntry[]
}

/** One compact row per thing a visitor might look for, in every language we ship. */
export function buildSearchIndex(sources: SearchSources): SearchRow[] {
  const rows: SearchRow[] = []

  for (const species of sources.species) {
    rows.push({ k: 'pokemon', s: String(species.id), names: species.names })
    // Named alternate forms (Mega, Gigantamax, regional...) are searchable on their own.
    for (const form of species.forms) {
      if (form.formSlug && form.names && form.kind !== 'cosmetic') {
        rows.push({ k: 'pokemon', s: `${species.id}/${form.formSlug}`, names: form.names })
      }
    }
  }
  for (const move of sources.moves) rows.push({ k: 'move', s: move.slug, names: move.names })
  for (const ability of sources.abilities) rows.push({ k: 'ability', s: ability.slug, names: ability.names })
  for (const item of sources.items) rows.push({ k: 'item', s: item.slug, names: item.names })
  for (const location of sources.locations) rows.push({ k: 'location', s: location.slug, names: location.names })
  for (const nature of sources.natures) rows.push({ k: 'nature', s: nature.slug, names: nature.names })
  for (const type of sources.types) if (type.hasPokemon) rows.push({ k: 'type', s: type.slug, names: type.names })

  return rows
}
