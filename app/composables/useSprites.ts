/** Sprite URLs are derived from the dex id so freshly added Pokémon get artwork with no code change. */
export function useSprites() {
  const { spriteBase, cryBase } = useRuntimeConfig().public

  return {
    artwork: (id: number) => `${spriteBase}/other/official-artwork/${id}.png`,
    shinyArtwork: (id: number) => `${spriteBase}/other/official-artwork/shiny/${id}.png`,
    pixel: (id: number) => `${spriteBase}/${id}.png`,
    cry: (id: number) => `${cryBase}/${id}.ogg`,
  }
}
