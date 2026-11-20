/** The current path without its language prefix, so "/ja/types" and "/types" both mean "types". */
export function useBarePath() {
  const route = useRoute()
  // Without the language prefix and without a trailing slash: the prerendered page and the browser disagree on it.
  return computed(() => route.path.replace(/^\/ja(?=\/|$)/, '').replace(/(.)\/+$/, '$1') || '/')
}

export function isNavActive(itemPath: string, barePath: string): boolean {
  // A Pokémon's own page belongs to the Pokédex; `/pokemon` itself is the advanced search.
  if (itemPath === '/') return barePath === '/' || barePath.startsWith('/pokemon/')
  if (itemPath === '/pokemon') return barePath === '/pokemon'
  return barePath === itemPath || barePath.startsWith(`${itemPath}/`)
}
