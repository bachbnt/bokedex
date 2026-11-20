/**
 * Visual identity for Pokémon types.
 * Known types get hand-picked colors; any type PokeAPI adds in the future
 * gets a stable color derived from its name, so nothing ever renders unstyled.
 */
const KNOWN_TYPE_COLORS: Record<string, string> = {
  normal: '#a8a77a',
  fire: '#ee8130',
  water: '#6390f0',
  electric: '#f7d02c',
  grass: '#7ac74c',
  ice: '#96d9d6',
  fighting: '#c22e28',
  poison: '#a33ea1',
  ground: '#e2bf65',
  flying: '#a98ff3',
  psychic: '#f95587',
  bug: '#a6b91a',
  rock: '#b6a136',
  ghost: '#735797',
  dragon: '#6f35fc',
  dark: '#705746',
  steel: '#b7b7ce',
  fairy: '#d685ad',
  stellar: '#40b5a5',
  unknown: '#68a090',
  shadow: '#4b3f72',
}

function hashHue(name: string): number {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 360
  return hash
}

function hslToHex(h: number, s: number, l: number): string {
  const a = (s * Math.min(l, 1 - l)) / 100
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    const value = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(255 * value).toString(16).padStart(2, '0')
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

export function typeColor(name: string): string {
  return KNOWN_TYPE_COLORS[name] ?? hslToHex(hashHue(name), 62, 55)
}

/** Pick black or white text for legibility on a hex background (WCAG relative luminance). */
export function readableInk(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = Number.parseInt(hex.slice(i, i + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.42 ? '#12163a' : '#ffffff'
}

/** CSS variables that theme a subtree to a Pokémon's types. */
export function pokemonTheme(types: string[]): Record<string, string> {
  const primary = typeColor(types[0] ?? 'normal')
  const secondary = typeColor(types[1] ?? types[0] ?? 'normal')
  return { '--poke': primary, '--poke-2': secondary }
}

/** 0.5 -> "½", 2 -> "2×" */
export function formatMultiplier(multiplier: number): string {
  if (multiplier === 0) return '0'
  if (multiplier === 0.25) return '¼'
  if (multiplier === 0.5) return '½'
  if (multiplier === 1) return '1'
  return `${multiplier}×`
}
