import { getPokemonDetail } from '#server/utils/pokemon'
import { parsePokemonId } from '#server/utils/params'

export default defineEventHandler(async (event) => {
  const id = parsePokemonId(event)
  setResponseHeader(event, 'cache-control', 'public, max-age=300, stale-while-revalidate=86400')
  try {
    return await getPokemonDetail(id)
  }
  catch {
    throw createError({ statusCode: 404, message: `No Pokémon found for id ${id}.` })
  }
})
