/**
 * Z-Moves (generation VII) and Max Moves (Sword and Shield).
 *
 * PokeAPI has the moves themselves, with names in both languages, but not the rule that turns a regular
 * move into one of them: the power conversion is fixed by the games, so it is written down here.
 * Everything else (names, types) comes from the move data.
 */

/** The Z-Move of each type, as PokeAPI names it (one entry per damage class: `<slug>--physical`). */
export const Z_MOVE_BY_TYPE: Record<string, string> = {
  normal: 'breakneck-blitz',
  fighting: 'all-out-pummeling',
  flying: 'supersonic-skystrike',
  poison: 'acid-downpour',
  ground: 'tectonic-rage',
  rock: 'continental-crush',
  bug: 'savage-spin-out',
  ghost: 'never-ending-nightmare',
  steel: 'corkscrew-crash',
  fire: 'inferno-overdrive',
  water: 'hydro-vortex',
  grass: 'bloom-doom',
  electric: 'gigavolt-havoc',
  psychic: 'shattered-psyche',
  ice: 'subzero-slammer',
  dragon: 'devastating-drake',
  dark: 'black-hole-eclipse',
  fairy: 'twinkle-tackle',
}

/** The Max Move of each type. */
export const MAX_MOVE_BY_TYPE: Record<string, string> = {
  normal: 'max-strike',
  fighting: 'max-knuckle',
  flying: 'max-airstream',
  poison: 'max-ooze',
  ground: 'max-quake',
  rock: 'max-rockfall',
  bug: 'max-flutterby',
  ghost: 'max-phantasm',
  steel: 'max-steelspike',
  fire: 'max-flare',
  water: 'max-geyser',
  grass: 'max-overgrowth',
  electric: 'max-lightning',
  psychic: 'max-mindstorm',
  ice: 'max-hailstorm',
  dragon: 'max-wyrmwind',
  dark: 'max-darkness',
  fairy: 'max-starfall',
}

export interface ZBand {
  /** How the range of base power reads in a table: "60–65", "≤ 55". */
  label: string
  /** Highest base power in the band. */
  upTo: number
  power: number
}

export interface MaxBand {
  label: string
  upTo: number
  power: number
  /** Fighting and Poison moves, which the games scale lower. */
  powerLow: number
}

/** Base power of the regular move, and the Z-Move it becomes. */
export const Z_BANDS: ZBand[] = [
  { label: '≤ 55', upTo: 55, power: 100 },
  { label: '60–65', upTo: 65, power: 120 },
  { label: '70–75', upTo: 75, power: 140 },
  { label: '80–85', upTo: 85, power: 160 },
  { label: '90–95', upTo: 95, power: 175 },
  { label: '100', upTo: 100, power: 180 },
  { label: '105–110', upTo: 110, power: 185 },
  { label: '115–125', upTo: 125, power: 190 },
  { label: '130–135', upTo: 135, power: 195 },
  { label: '≥ 140', upTo: Number.POSITIVE_INFINITY, power: 200 },
]

/** Base power of the regular move, and the Max Move it becomes. */
export const MAX_BANDS: MaxBand[] = [
  { label: '≤ 40', upTo: 40, power: 90, powerLow: 70 },
  { label: '45–50', upTo: 50, power: 100, powerLow: 75 },
  { label: '55–60', upTo: 60, power: 110, powerLow: 80 },
  { label: '65–70', upTo: 70, power: 120, powerLow: 85 },
  { label: '75–110', upTo: 110, power: 130, powerLow: 90 },
  { label: '115–125', upTo: 125, power: 140, powerLow: 95 },
  { label: '≥ 130', upTo: Number.POSITIVE_INFINITY, power: 150, powerLow: 100 },
]

export function zMovePower(base: number): number {
  return (Z_BANDS.find(band => base <= band.upTo) ?? Z_BANDS.at(-1)!).power
}

export function maxMovePower(base: number, type: string): number {
  const band = MAX_BANDS.find(entry => base <= entry.upTo) ?? MAX_BANDS.at(-1)!
  return type === 'fighting' || type === 'poison' ? band.powerLow : band.power
}

/** Z-Moves that belong to one Pokémon, which are not a conversion of any regular move. */
const EXCLUSIVE_Z_MOVES = new Set([
  'catastropika', '10-000-000-volt-thunderbolt', 'stoked-sparksurfer', 'extreme-evoboost', 'pulverizing-pancake',
  'genesis-supernova', 'sinister-arrow-raid', 'malicious-moonsault', 'oceanic-operetta', 'guardian-of-alola',
  'soul-stealing-7-star-strike', 'searing-sunraze-smash', 'menacing-moonraze-maelstrom', 'lets-snuggle-forever',
  'splintered-stormshards', 'clangorous-soulblaze', 'light-that-burns-the-sky',
])

/** True for the Z-Moves and Max Moves themselves, which do not convert again. */
export function isBattleMove(slug: string): boolean {
  return slug.includes('--') || slug.startsWith('max-') || slug.startsWith('g-max-') || EXCLUSIVE_Z_MOVES.has(slug)
}

interface Convertible {
  slug: string
  type: string
  damageClass: string
  power: number | null
}

export interface BattleMoves {
  z: { slug: string, power: number }
  max: { slug: string, power: number }
}

/** The Z-Move and Max Move a damaging move turns into, or null for status moves and moves without power. */
export function battleMovesOf(move: Convertible): BattleMoves | null {
  if (isBattleMove(move.slug) || move.power === null || (move.damageClass !== 'physical' && move.damageClass !== 'special')) return null
  const z = Z_MOVE_BY_TYPE[move.type]
  const max = MAX_MOVE_BY_TYPE[move.type]
  if (!z || !max) return null
  return {
    z: { slug: `${z}--${move.damageClass}`, power: zMovePower(move.power) },
    max: { slug: max, power: maxMovePower(move.power, move.type) },
  }
}
