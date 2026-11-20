import { getDexSnapshot } from '#server/utils/snapshot'

/** Compact index of every Pokémon. Prerendered to `/api/dex.json` at build time. */
export default defineEventHandler(async () => {
  try {
    return (await getDexSnapshot()).index
  }
  catch {
    throw createError({ statusCode: 502, message: 'PokeAPI is unreachable. Try again in a moment.' })
  }
})
