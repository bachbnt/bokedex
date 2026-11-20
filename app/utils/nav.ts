export interface NavItem {
  to: string
  /** i18n key of the label. */
  label: string
  icon: string
}

const dex: NavItem = { to: '/', label: 'nav.pokedex', icon: 'dex' }
const moves: NavItem = { to: '/moves', label: 'nav.moves', icon: 'bolt' }
const items: NavItem = { to: '/items', label: 'nav.items', icon: 'bag' }
const team: NavItem = { to: '/team', label: 'nav.team', icon: 'team' }

/** Always visible in the header. */
export const PRIMARY_NAV: NavItem[] = [
  dex,
  moves,
  { to: '/abilities', label: 'nav.abilities', icon: 'sparkle' },
  items,
  team,
]

/** The short list on the mobile bar; everything else is under "More". */
export const MOBILE_NAV: NavItem[] = [dex, moves, items, team]

/** Reference sections and tools, grouped in the "More" menu. */
export const MORE_NAV: NavItem[] = [
  { to: '/locations', label: 'nav.locations', icon: 'map' },
  { to: '/types', label: 'nav.types', icon: 'shield' },
  { to: '/natures', label: 'nav.natures', icon: 'leaf' },
  { to: '/berries', label: 'nav.berries', icon: 'leaf' },
  { to: '/games', label: 'nav.games', icon: 'game' },
  { to: '/pokedex', label: 'nav.pokedexes', icon: 'book' },
  { to: '/generations', label: 'nav.generations', icon: 'scale' },
  { to: '/regions', label: 'nav.regions', icon: 'globe' },
  { to: '/egg-groups', label: 'nav.eggGroups', icon: 'egg' },
  { to: '/pokemon', label: 'nav.advanced', icon: 'search' },
  { to: '/compare', label: 'nav.compare', icon: 'scale' },
  { to: '/calculator', label: 'nav.calculator', icon: 'bolt' },
  { to: '/play', label: 'nav.play', icon: 'trophy' },
]
