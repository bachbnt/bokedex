/**
 * Sprite URLs are derived from the Pokémon id (or item slug), so new Pokémon get artwork with no code change.
 * Alternate forms use their own PokeAPI id (10034 for Mega Charizard X).
 */
export function useSprites() {
  const { spriteBase, itemSpriteBase, cryBase } = useRuntimeConfig().public

  return {
    artwork: (id: number) => `${spriteBase}/other/official-artwork/${id}.png`,
    shinyArtwork: (id: number) => `${spriteBase}/other/official-artwork/shiny/${id}.png`,
    home: (id: number) => `${spriteBase}/other/home/${id}.png`,
    homeShiny: (id: number) => `${spriteBase}/other/home/shiny/${id}.png`,
    homeFemale: (id: number) => `${spriteBase}/other/home/female/${id}.png`,
    pixel: (id: number) => `${spriteBase}/${id}.png`,
    pixelBack: (id: number) => `${spriteBase}/back/${id}.png`,
    pixelShiny: (id: number) => `${spriteBase}/shiny/${id}.png`,
    pixelShinyBack: (id: number) => `${spriteBase}/back/shiny/${id}.png`,
    animated: (id: number) => `${spriteBase}/other/showdown/${id}.gif`,
    item: (slug: string) => `${itemSpriteBase}/${slug}.png`,
    cry: (id: number) => `${cryBase}/${id}.ogg`,
  }
}
