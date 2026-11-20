export const STAT_CAP = 255

export type StatTier = 'elite' | 'strong' | 'solid' | 'average' | 'early'

/** Rough in-game verdict for a base-stat total; the label is translated in the UI (`pokemon.statTier.*`). */
export function statTotalTier(total: number): StatTier {
  if (total >= 600) return 'elite'
  if (total >= 500) return 'strong'
  if (total >= 400) return 'solid'
  if (total >= 300) return 'average'
  return 'early'
}
