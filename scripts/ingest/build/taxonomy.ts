import type { Names, Taxonomy, TaxonomyKind } from '#shared/types/encyclopedia'
import { names } from '#ingest/l10n'
import { GLOSSARY_JA } from '#ingest/glossary'
import type { LangName } from '#ingest/raw'
import { readAll } from '#ingest/source'

interface RawTaxon {
  name: string
  names?: LangName[]
  descriptions?: { description: string, language: { name: string } }[]
}

/** Which PokeAPI endpoint feeds each lookup table. */
const ENDPOINTS: Record<TaxonomyKind, string | null> = {
  'color': 'pokemon-color',
  'shape': 'pokemon-shape',
  'habitat': 'pokemon-habitat',
  'growth-rate': 'growth-rate',
  'egg-group': 'egg-group',
  'damage-class': 'move-damage-class',
  'move-target': 'move-target',
  'move-ailment': 'move-ailment',
  'move-category': 'move-category',
  'learn-method': 'move-learn-method',
  'item-category': 'item-category',
  'item-pocket': 'item-pocket',
  'item-attribute': 'item-attribute',
  'fling-effect': 'item-fling-effect',
  'berry-firmness': 'berry-firmness',
  'flavor': 'berry-flavor',
  'stat': 'stat',
  'encounter-method': 'encounter-method',
  'encounter-condition': 'encounter-condition-value',
  'contest-type': 'contest-type',
  'version': 'version',
  'version-group': null,
  'region': 'region',
  'pokedex': 'pokedex',
  'time-of-day': null,
  'evolution-trigger': 'evolution-trigger',
}

/** Slugs that exist in the data but have no PokeAPI resource of their own. */
const STATIC_SLUGS: Partial<Record<TaxonomyKind, string[]>> = {
  'time-of-day': ['day', 'night', 'dusk'],
}

function toNames(raw: RawTaxon): Names {
  // Some tables (growth rates, move categories) only describe themselves; treat descriptions as names.
  const entries: LangName[] = raw.names?.length
    ? raw.names
    : (raw.descriptions ?? []).map(description => ({ language: description.language, name: description.description }))
  return names(entries, raw.name)
}

/**
 * Small lookup tables merged with our own Japanese glossary, which fills the gaps PokeAPI leaves
 * (it has no Japanese for habitats, shapes, item categories, move targets and similar).
 */
export function buildTaxonomy(): Taxonomy {
  const result = {} as Taxonomy

  for (const kind of Object.keys(ENDPOINTS) as TaxonomyKind[]) {
    const endpoint = ENDPOINTS[kind]
    const table: Record<string, Names> = {}
    for (const raw of endpoint ? readAll<RawTaxon>(endpoint) : []) table[raw.name] = toNames(raw)
    for (const slug of STATIC_SLUGS[kind] ?? []) table[slug] = names([], slug)

    const glossary = GLOSSARY_JA[kind] ?? {}
    for (const [slug, ja] of Object.entries(glossary)) {
      const existing = table[slug]
      if (existing && !existing.ja) existing.ja = ja
      else if (!existing) table[slug] = { ...names([], slug), ja }
    }
    result[kind] = table
  }

  return result
}

/** Slugs that still have no Japanese after merging; printed so the glossary can be completed. */
export function missingJapanese(taxonomy: Taxonomy): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(taxonomy)
      .map(([kind, table]) => [kind, Object.entries(table).filter(([, value]) => !value.ja).map(([slug]) => slug)] as const)
      .filter(([, missing]) => missing.length),
  )
}
