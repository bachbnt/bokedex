export interface NavItem {
  to: string
  label: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Pokédex', icon: 'dex' },
  { to: '/types', label: 'Type chart', icon: 'shield' },
  { to: '/team', label: 'Team', icon: 'team' },
  { to: '/play', label: 'Play', icon: 'game' },
]
