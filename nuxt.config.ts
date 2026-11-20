import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://bokedex.web.app'

/** Pages that are not one-per-entity. Each exists in every language. */
const STATIC_ROUTES = ['/', '/types', '/team', '/play']

/** Entity pages (`/pokemon/25`, `/moves/thunderbolt`...) written by `npm run ingest`. */
function entityRoutes(): string[] {
  const file = fileURLToPath(new URL('./data/generated/routes.json', import.meta.url))
  return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as string[]) : []
}

/** The site is prerendered in every language, so each route is listed with its `/ja` twin. */
const withLanguages = (routes: string[]) => routes.flatMap(route => [route, route === '/' ? '/ja' : `/ja${route}`])

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // `#server/...` mirrors the built-in `#shared/...`, so server code never needs `../` paths.
  alias: {
    '#server': fileURLToPath(new URL('./server', import.meta.url)),
  },

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxt/fonts', '@nuxtjs/i18n'],

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    // Static hosting cannot redirect by Accept-Language; the visitor picks a language explicitly.
    detectBrowserLanguage: false,
    baseUrl: SITE_URL,
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'ja', language: 'ja-JP', name: '日本語', file: 'ja.json' },
    ],
  },

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
      // Japanese glyphs: the Latin fonts above have none, so name a Japanese face to avoid mismatched fallbacks.
      { name: 'Noto Sans JP', provider: 'google', weights: [400, 500, 700], subsets: ['japanese'] },
    ],
  },

  // Shared-element morph between a card in the grid and the detail hero.
  experimental: {
    viewTransition: true,
  },

  runtimeConfig: {
    public: {
      siteUrl: SITE_URL,
      // Sprites are derived from the dex id, so new Pokémon get artwork automatically.
      spriteBase: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon',
      itemSpriteBase: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items',
      cryBase: 'https://cdn.jsdelivr.net/gh/PokeAPI/cries@main/cries/pokemon/latest',
    },
  },

  // Static hosting: `nuxt generate` prerenders every page from the data `npm run ingest` produced.
  // A page that cannot be built fails the build instead of silently shipping a hole.
  nitro: {
    prerender: {
      crawlLinks: false,
      failOnError: true,
      concurrency: 8,
      routes: withLanguages([...STATIC_ROUTES, ...entityRoutes()]),
    },
  },

  app: {
    head: {
      title: 'Bokedex',
      meta: [
        { name: 'theme-color', content: '#f2384a' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  typescript: {
    strict: true,
  },
})
