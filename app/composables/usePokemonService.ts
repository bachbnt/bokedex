import { createPokeApi } from '#shared/pokeapi/client'
import { createPokemonService, type PokemonService } from '#shared/pokeapi/pokemon'

// One service per page session so its lookup cache survives navigation between Pokémon.
let service: PokemonService | undefined

/** Details and moves for a Pokémon, fetched straight from PokeAPI in the browser. */
export function usePokemonService(): PokemonService {
  service ??= createPokemonService(createPokeApi(useRuntimeConfig().public.pokeApiBase))
  return service
}
