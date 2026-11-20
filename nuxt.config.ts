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
    // Public because the browser fetches Pokémon details straight from PokeAPI.
    // Swap for a self-hosted PokeAPI mirror if needed.
    public: {
      pokeApiBase: 'https://pokeapi.co/api/v2',
      // Sprites are derived from the dex id, so new Pokémon get artwork automatically.
      spriteBase: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon',
      cryBase: 'https://cdn.jsdelivr.net/gh/PokeAPI/cries@main/cries/pokemon/latest',
    },
  },

  // Static hosting: `nuxt generate` bakes the dex and type chart into JSON and prerenders the main
  // pages. Pokémon detail pages are rendered in the browser because there are too many to prerender.
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/', '/types', '/team', '/play', '/api/dex.json', '/api/types.json'],
    },
  },

  routeRules: {
    '/pokemon/**': { ssr: false },
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
