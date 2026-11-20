import { createPokeApi } from '#shared/pokeapi/client'
import { buildDexSnapshot } from '#shared/pokeapi/dex'

const CACHE_SECONDS = 60 * 60

/**
 * The dex index and type chart, built from PokeAPI. In production this runs once at build time
 * (the routes below are prerendered into static JSON); in `nuxt dev` it is cached for an hour.
 */
export const getDexSnapshot = defineCachedFunction(
  () => buildDexSnapshot(createPokeApi(useRuntimeConfig().public.pokeApiBase)),
  { name: 'dex-snapshot', maxAge: CACHE_SECONDS, swr: true },
)
