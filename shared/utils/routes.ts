/** Pages that are not one-per-entity. Each exists in every language. */
export const STATIC_ROUTES = [
  '/', '/types', '/team', '/play', '/moves', '/abilities', '/natures', '/items', '/berries',
  '/locations', '/games', '/pokedex', '/generations', '/regions', '/egg-groups',
  '/pokemon', '/compare', '/calculator',
]

/** Path prefix of each non-default language. English lives at the root. */
export const LANGUAGE_PREFIXES = ['/ja']

/** `/moves` -> [`/moves`, `/ja/moves`]; the home page becomes `/` and `/ja`. */
export function withLanguages(route: string): string[] {
  return [route, ...LANGUAGE_PREFIXES.map(prefix => (route === '/' ? prefix : `${prefix}${route}`))]
}
