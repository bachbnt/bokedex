import type { EncounterGroup, LocationArea, LocationEntry, LocationRow, RegionEntry } from '#shared/types/encyclopedia'
import { names } from '#ingest/l10n'
import type { RawEncounterDetail, RawLocation, RawLocationArea, RawRegion } from '#ingest/raw'
import { idFromUrl, ids, read, readAll } from '#ingest/source'
import type { AreaRef } from '#ingest/build/pokemon'

export interface WorldBuild {
  locations: LocationEntry[]
  rows: LocationRow[]
  regions: RegionEntry[]
}

/** Area id -> where it is. The Pokémon builder needs this to say where each Pokémon can be found. */
export function buildAreaRefs(): Map<number, AreaRef> {
  const refs = new Map<number, AreaRef>()
  for (const id of ids('location-area')) {
    const area = read<RawLocationArea>(`location-area/${id}`)
    refs.set(id, { location: area.location.name, area: area.name })
  }
  return refs
}

interface Groupable {
  pokemon: number
  version: string
  detail: RawEncounterDetail
}

/** Merge versions that share the same Pokémon, method, levels, chance and conditions. */
function groupEncounters(items: Groupable[]): EncounterGroup[] {
  const merged = new Map<string, EncounterGroup>()
  for (const { pokemon, version, detail } of items) {
    const conditions = detail.condition_values.map(value => value.name).sort()
    const key = [pokemon, detail.method.name, detail.min_level, detail.max_level, detail.chance, conditions.join('+')].join('|')
    const existing = merged.get(key)
    if (existing) existing.versions.push(version)
    else {
      merged.set(key, {
        pokemon,
        versions: [version],
        method: detail.method.name,
        minLevel: detail.min_level,
        maxLevel: detail.max_level,
        chance: detail.chance,
        conditions,
      })
    }
  }
  return [...merged.values()].sort((a, b) => a.pokemon - b.pokemon)
}

function buildArea(areaId: number, speciesByPokemonId: Map<number, number>): LocationArea {
  const raw = read<RawLocationArea>(`location-area/${areaId}`)
  const items: Groupable[] = raw.pokemon_encounters.flatMap((entry) => {
    const pokemon = speciesByPokemonId.get(idFromUrl(entry.pokemon.url))
    if (pokemon === undefined) return []
    return entry.version_details.flatMap(version =>
      version.encounter_details.map(detail => ({ pokemon, version: version.version.name, detail })),
    )
  })
  return { id: areaId, slug: raw.name, names: names(raw.names, raw.name), encounters: groupEncounters(items) }
}

export function buildWorld(speciesByPokemonId: Map<number, number>): WorldBuild {
  const locations: LocationEntry[] = ids('location').map((id) => {
    const raw = read<RawLocation>(`location/${id}`)
    return {
      id,
      slug: raw.name,
      names: names(raw.names, raw.name),
      region: raw.region?.name ?? null,
      areas: raw.areas.map(area => buildArea(idFromUrl(area.url), speciesByPokemonId)),
    }
  })

  const rows: LocationRow[] = locations.map(location => ({
    id: location.id,
    slug: location.slug,
    names: location.names,
    region: location.region,
    areaCount: location.areas.length,
    encounterCount: new Set(location.areas.flatMap(area => area.encounters.map(encounter => encounter.pokemon))).size,
  }))

  const regions: RegionEntry[] = readAll<RawRegion>('region').map(raw => ({
    id: raw.id,
    slug: raw.name,
    names: names(raw.names, raw.name),
    mainGeneration: raw.main_generation ? idFromUrl(raw.main_generation.url) : null,
    locations: raw.locations.map(location => location.name),
    pokedexes: raw.pokedexes.map(pokedex => pokedex.name),
    versionGroups: raw.version_groups.map(group => group.name),
  }))

  return { locations, rows, regions }
}
