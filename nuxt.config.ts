import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // `#server/...` mirrors the built-in `#shared/...`, so server code never needs `../` paths.
  alias: {
    '#server': fileURLToPath(new URL('./server', import.meta.url)),
  },

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxt/fonts'],

  pinia: {
    storesDirs: ['./stores/**'],
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  fonts: {
    families: [
      { name: 'Bricolage Grotesque', provider: 'google', weights: [500, 700, 800] },
      { name: 'Instrument Sans', provider: 'google', weights: [400, 500, 600] },
    ],
  },

  // Shared-element morph between a card in the grid and the detail hero.
  experimental: {
    viewTransition: true,
  },

  runtimeConfig: {
    // Server-only: where Pokémon data comes from. Swap for a self-hosted PokeAPI if needed.
    pokeApiBase: 'https://pokeapi.co/api/v2',
    // How long (seconds) upstream data stays fresh in the Nitro cache.
    cacheMaxAge: 60 * 60 * 24,
    public: {
      // Sprites are derived from the dex id, so new Pokémon get artwork automatically.
      spriteBase: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon',
      cryBase: 'https://cdn.jsdelivr.net/gh/PokeAPI/cries@main/cries/pokemon/latest',
    },
  },

  routeRules: {
    '/': { swr: 3600 },
    '/types': { swr: 3600 },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Bokedex',
      meta: [
        { name: 'description', content: 'Bokedex is a Pokédex and game companion: browse every Pokémon, check type matchups, build teams and play quizzes.' },
        { name: 'theme-color', content: '#f2384a' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  typescript: {
    strict: true,
  },
})
