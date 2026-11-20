import type { H3Event } from 'h3'

/** Dex ids are positive integers; reject anything else before it reaches upstream. */
export function parsePokemonId(event: H3Event): number {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1 || id > 100_000) {
    throw createError({ statusCode: 400, message: 'Pokémon id must be a positive whole number.' })
  }
  return id
}
