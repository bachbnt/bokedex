export const STAT_KEYS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'] as const
export type StatKey = (typeof STAT_KEYS)[number]

export const MAX_IV = 31
export const MAX_EV = 252
export const MAX_TOTAL_EV = 510

/** Nature multiplier for a stat: +10%, -10% or none. */
export function natureMultiplier(stat: StatKey, increased: string | null, decreased: string | null): number {
  if (increased === decreased) return 1
  if (stat === increased) return 1.1
  if (stat === decreased) return 0.9
  return 1
}

/**
 * A stat at a given level, using the games' formula (generation III onwards).
 * HP has its own formula and no nature; Shedinja's HP is always 1.
 */
export function calcStat(options: { stat: StatKey, base: number, level: number, iv: number, ev: number, multiplier?: number, shedinja?: boolean }): number {
  const { stat, base, level, iv, ev, multiplier = 1, shedinja = false } = options
  const core = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100)
  if (stat === 'hp') return shedinja ? 1 : core + level + 10
  return Math.floor((core + 5) * multiplier)
}
