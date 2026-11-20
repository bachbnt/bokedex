import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type {
  AbilityRow,
  DexEntry,
  EntityKind,
  ItemRow,
  LocationRow,
  MoveRow,
  Taxonomy,
} from '#shared/types/encyclopedia'

/** Entity kinds the API will serve; anything else is rejected before touching the disk. */
export const ENTITY_KINDS: readonly EntityKind[] = [
  'pokemon', 'moves', 'abilities', 'items', 'locations', 'types', 'generations', 'games', 'pokedexes', 'regions', 'egg-groups',
]

const GENERATED = join(process.cwd(), 'data', 'generated')
const PUBLISHED = join(process.cwd(), 'public', 'data')

const cache = new Map<string, unknown>()

function readCached<T>(file: string): T | null {
  if (cache.has(file)) return cache.get(file) as T
  if (!existsSync(file)) return null
  const parsed = JSON.parse(readFileSync(file, 'utf8')) as T
  cache.set(file, parsed)
  return parsed
}

/** One entity as written by `npm run ingest`, or null when it does not exist. */
export function readEntity<T>(kind: EntityKind, key: string): T | null {
  return readCached<T>(join(GENERATED, 'entities', kind, `${key}.json`))
}

/** A published list (dex, moves, items...). Fails loudly: pages cannot be built without the data. */
export function readDataset<T>(name: string): T {
  const data = readCached<T>(join(PUBLISHED, `${name}.json`))
  if (!data) throw new Error(`Missing dataset "${name}". Run \`npm run ingest\` first.`)
  return data
}

export interface Lookup {
  pokemon: Map<number, DexEntry>
  pokemonBySlug: Map<string, DexEntry>
  moves: Map<string, MoveRow>
  abilities: Map<string, AbilityRow>
  items: Map<string, ItemRow>
  locations: Map<string, LocationRow>
  taxonomy: Taxonomy
}

let lookup: Lookup | null = null

/** Indexed views of the published lists, built once per process. */
export function getLookup(): Lookup {
  if (lookup) return lookup
  const dex = readDataset<DexEntry[]>('dex')
  lookup = {
    pokemon: new Map(dex.map(entry => [entry.id, entry])),
    pokemonBySlug: new Map(dex.map(entry => [entry.slug, entry])),
    moves: new Map(readDataset<MoveRow[]>('moves').map(row => [row.slug, row])),
    abilities: new Map(readDataset<AbilityRow[]>('abilities').map(row => [row.slug, row])),
    items: new Map(readDataset<ItemRow[]>('items').map(row => [row.slug, row])),
    locations: new Map(readDataset<LocationRow[]>('locations').map(row => [row.slug, row])),
    taxonomy: readDataset<Taxonomy>('taxonomy'),
  }
  return lookup
}
