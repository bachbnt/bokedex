import { readDataset } from '#server/utils/store'

/** The published lists, in the order a page might ask for them. Anything else is rejected. */
const DATASETS = ['dex', 'pokemon-table', 'moves', 'abilities', 'items', 'berries', 'locations', 'types', 'reference', 'taxonomy'] as const

/**
 * Server-side access to the published lists. The browser reads the same data from the static `/data/*.json`
 * files; the server cannot fetch those over HTTP in `nuxt dev` (the dev server, not Nitro, serves `public/`),
 * so while rendering it asks this route instead.
 */
export default defineEventHandler((event) => {
  const name = getRouterParam(event, 'name') ?? ''
  if (!(DATASETS as readonly string[]).includes(name)) {
    throw createError({ statusCode: 404, message: 'Unknown dataset' })
  }
  return readDataset<unknown>(name)
})
