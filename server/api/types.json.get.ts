import { getDexSnapshot } from '#server/utils/snapshot'

/** Damage relations for every type that has Pokémon. Prerendered to `/api/types.json` at build time. */
export default defineEventHandler(async () => {
  try {
    return (await getDexSnapshot()).types
  }
  catch {
    throw createError({ statusCode: 502, message: 'PokeAPI is unreachable. Try again in a moment.' })
  }
})
