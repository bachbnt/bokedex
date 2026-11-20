/** The current path without its language prefix, so "/ja/types" and "/types" both mean "types". */
export function useBarePath() {
  const route = useRoute()
  return computed(() => route.path.replace(/^\/ja(?=\/|$)/, '') || '/')
}

export function isNavActive(itemPath: string, barePath: string): boolean {
  if (itemPath === '/') return barePath === '/' || barePath.startsWith('/pokemon')
  return barePath === itemPath || barePath.startsWith(`${itemPath}/`)
}
