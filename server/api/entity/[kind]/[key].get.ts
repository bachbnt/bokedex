import type { EntityByKind, EntityKind, EntityResponse } from '#shared/types/encyclopedia'
import { collectRefs } from '#server/utils/refs'
import { ENTITY_KINDS, getLookup, readEntity } from '#server/utils/store'

const KEY_PATTERN = /^[a-z0-9-]+$/

/**
 * One encyclopedia page's data plus the small rows it references. Only used while the site is built
 * (prerendering) and in `nuxt dev`; in production every page is static HTML plus a payload file.
 */
export default defineEventHandler((event): EntityResponse<EntityByKind[EntityKind]> => {
  const kind = getRouterParam(event, 'kind') as EntityKind
  const key = getRouterParam(event, 'key') ?? ''

  if (!ENTITY_KINDS.includes(kind) || !KEY_PATTERN.test(key)) {
    throw createError({ statusCode: 404, message: 'Not found' })
  }

  const data = readEntity<EntityByKind[EntityKind]>(kind, key)
  if (!data) throw createError({ statusCode: 404, message: 'Not found' })

  return { data, refs: collectRefs(kind, data, getLookup()) }
})
