export interface NavItem {
  to: string
  /** i18n key of the label. */
  label: string
  icon: string
}

/** Always visible in the header and the mobile bar. */
export const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'nav.pokedex', icon: 'dex' },
  { to: '/types', label: 'nav.types', icon: 'shield' },
  { to: '/team', label: 'nav.team', icon: 'team' },
  { to: '/play', label: 'nav.play', icon: 'game' },
]

/** Reference sections, grouped in the "More" menu. */
export const MORE_NAV: NavItem[] = []
