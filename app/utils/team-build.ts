import { calcStat, MAX_EV, MAX_IV, MAX_TOTAL_EV, natureMultiplier, STAT_KEYS } from '~/utils/stat-calc'
import type { StatKey } from '~/utils/stat-calc'

export const DEFAULT_LEVEL = 50

/** How one team member is set up: the choices that change its stats and its typing in battle. */
export interface TeamBuild {
  /** Tera type; while terastallized the Pokémon is only that type defensively. */
  tera: string | null
  nature: string | null
  ability: string | null
  level: number
  ivs: Record<StatKey, number>
  evs: Record<StatKey, number>
}

export interface NatureLike {
  increasedStat: string | null
  decreasedStat: string | null
}

const perStat = (value: number): Record<StatKey, number> =>
  ({ 'hp': value, 'attack': value, 'defense': value, 'special-attack': value, 'special-defense': value, 'speed': value })

export const defaultBuild = (): TeamBuild => ({ tera: null, nature: null, ability: null, level: DEFAULT_LEVEL, ivs: perStat(MAX_IV), evs: perStat(0) })

const whole = (value: unknown, min: number, max: number, fallback: number): number => {
  const number = Math.floor(Number(value))
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

/** Fills the gaps and clamps every number, so saved or hand-edited data can never break a page. */
export function normalizeBuild(raw?: Partial<TeamBuild> | null): TeamBuild {
  const base = defaultBuild()
  const evs = { ...base.evs }
  let spent = 0
  for (const stat of STAT_KEYS) {
    const value = whole(raw?.evs?.[stat], 0, MAX_EV, 0)
    evs[stat] = Math.min(value, MAX_TOTAL_EV - spent)
    spent += evs[stat]
  }
  return {
    tera: typeof raw?.tera === 'string' && raw.tera ? raw.tera : null,
    nature: typeof raw?.nature === 'string' && raw.nature ? raw.nature : null,
    ability: typeof raw?.ability === 'string' && raw.ability ? raw.ability : null,
    level: whole(raw?.level, 1, 100, DEFAULT_LEVEL),
    ivs: Object.fromEntries(STAT_KEYS.map(stat => [stat, whole(raw?.ivs?.[stat], 0, MAX_IV, MAX_IV)])) as Record<StatKey, number>,
    evs,
  }
}

export const evTotal = (build: TeamBuild): number => STAT_KEYS.reduce((sum, stat) => sum + build.evs[stat], 0)

/** Sets one EV, holding to 252 per stat and 510 in total (extra points are simply not spent). */
export function withEv(build: TeamBuild, stat: StatKey, value: number): TeamBuild {
  const others = evTotal(build) - build.evs[stat]
  const next = Math.min(whole(value, 0, MAX_EV, 0), Math.max(0, MAX_TOTAL_EV - others))
  return { ...build, evs: { ...build.evs, [stat]: next } }
}

/** The six real stats, in `STAT_KEYS` order. */
export function buildStats(base: number[], build: TeamBuild, nature: NatureLike | undefined, shedinja = false): number[] {
  return STAT_KEYS.map((stat, index) => calcStat({
    stat,
    base: base[index] ?? 0,
    level: build.level,
    iv: build.ivs[stat],
    ev: build.evs[stat],
    multiplier: natureMultiplier(stat, nature?.increasedStat ?? null, nature?.decreasedStat ?? null),
    shedinja,
  }))
}

/** Types that count when something hits the Pokémon: terastallizing replaces them. */
export const defensiveTypes = (types: string[], tera: string | null): string[] => (tera ? [tera] : types)

/** Types it gets the same-type bonus for: terastallizing adds one and keeps the originals. */
export const offensiveTypes = (types: string[], tera: string | null): string[] => (tera && !types.includes(tera) ? [...types, tera] : types)
