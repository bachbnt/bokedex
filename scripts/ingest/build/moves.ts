import type { MoveEntry, MoveRow } from '#shared/types/encyclopedia'
import { effectOf, flavorBy, names } from '#ingest/l10n'
import type { RawMachine, RawMove } from '#ingest/raw'
import { idFromUrl, readAll, read, ids } from '#ingest/source'

export interface Machine {
  id: number
  /** TM or HM item slug, such as `tm24`. */
  item: string
  move: string
  versionGroup: string
}

export interface MovesBuild {
  entries: MoveEntry[]
  rows: MoveRow[]
}

export function readMachines(): Map<number, Machine> {
  return new Map(
    readAll<RawMachine>('machine').map(raw => [
      raw.id,
      { id: raw.id, item: raw.item.name, move: raw.move.name, versionGroup: raw.version_group.name },
    ]),
  )
}

/** `$effect_chance` is a placeholder upstream; the real number lives in a separate field. */
const fillChance = (text: { en?: string, ja?: string }, chance: number | null) => {
  const fill = (value: string | undefined) => value?.replace('$effect_chance', String(chance ?? ''))
  return { ...(text.en ? { en: fill(text.en) } : {}), ...(text.ja ? { ja: fill(text.ja) } : {}) }
}

export function buildMoves(speciesByPokemonId: Map<number, number>, machines: Map<number, Machine>): MovesBuild {
  const entries: MoveEntry[] = ids('move').map((id) => {
    const raw = read<RawMove>(`move/${id}`)
    const learnedBy = [...new Set(raw.learned_by_pokemon.flatMap((pokemon) => {
      const species = speciesByPokemonId.get(idFromUrl(pokemon.url))
      return species === undefined ? [] : [species]
    }))].sort((a, b) => a - b)

    return {
      id,
      slug: raw.name,
      names: names(raw.names, raw.name),
      type: raw.type.name,
      damageClass: raw.damage_class.name,
      power: raw.power,
      accuracy: raw.accuracy,
      pp: raw.pp,
      priority: raw.priority,
      target: raw.target.name,
      generation: idFromUrl(raw.generation.url),
      effectChance: raw.effect_chance,
      effect: fillChance(effectOf(raw.effect_entries, 'short_effect'), raw.effect_chance),
      flavor: flavorBy(raw.flavor_text_entries, 'version_group').map(entry => ({ versionGroup: entry.key, text: entry.text })),
      meta: raw.meta
        ? {
            ailment: raw.meta.ailment && raw.meta.ailment.name !== 'none' ? raw.meta.ailment.name : null,
            ailmentChance: raw.meta.ailment_chance,
            category: raw.meta.category?.name ?? null,
            minHits: raw.meta.min_hits,
            maxHits: raw.meta.max_hits,
            minTurns: raw.meta.min_turns,
            maxTurns: raw.meta.max_turns,
            drain: raw.meta.drain,
            healing: raw.meta.healing,
            critRate: raw.meta.crit_rate,
            flinchChance: raw.meta.flinch_chance,
            statChance: raw.meta.stat_chance,
          }
        : null,
      statChanges: raw.stat_changes.map(change => ({ stat: change.stat.name, change: change.change })),
      machines: raw.machines.flatMap((entry) => {
        const machine = machines.get(idFromUrl(entry.machine.url))
        return machine ? [{ versionGroup: machine.versionGroup, item: machine.item }] : []
      }),
      contestType: raw.contest_type?.name ?? null,
      learnedBy,
    }
  })

  const rows: MoveRow[] = entries.map(move => ({
    id: move.id,
    slug: move.slug,
    names: move.names,
    type: move.type,
    damageClass: move.damageClass,
    power: move.power,
    accuracy: move.accuracy,
    pp: move.pp,
    priority: move.priority,
    target: move.target,
    generation: move.generation,
    ailment: move.meta?.ailment ?? null,
  }))

  return { entries, rows }
}
