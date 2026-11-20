import { getTypeInfos } from '#server/utils/dex'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'public, max-age=300, stale-while-revalidate=86400')
  try {
    return await getTypeInfos()
  }
  catch {
    throw createError({ statusCode: 502, message: 'PokeAPI is unreachable. Try again in a moment.' })
  }
})
