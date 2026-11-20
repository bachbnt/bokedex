/** Display metadata for base stats. Unknown stats fall back to a title-cased key. */
const STAT_LABELS: Record<string, string> = {
  'hp': 'HP',
  'attack': 'Attack',
  'defense': 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  'speed': 'Speed',
}

export const STAT_CAP = 255

export function statLabel(key: string): string {
  return STAT_LABELS[key] ?? titleCase(key)
}

/** Rough in-game verdict for a base-stat total, to help players judge a Pokémon at a glance. */
export function statTotalTier(total: number): string {
  if (total >= 600) return 'Pseudo-legendary or better'
  if (total >= 500) return 'Strong'
  if (total >= 400) return 'Solid'
  if (total >= 300) return 'Average'
  return 'Early-game'
}
