import type { EntityByKind, EntityKind, EntityResponse } from '#shared/types/encyclopedia'

/**
 * Load one encyclopedia entity (a Pokémon, a move, an item...) together with the names and rows it references.
 * Every entity page is prerendered, so in production this resolves from the page's own payload file.
 * Throws a 404 for a missing entity, which the app's error page renders.
 */
export async function useEntity<K extends EntityKind>(kind: K, key: MaybeRefOrGetter<string | number>) {
  const request = useAsyncData(
    () => `entity:${kind}:${toValue(key)}`,
    () => $fetch<EntityResponse<EntityByKind[K]>>(`/api/entity/${kind}/${toValue(key)}`),
    { watch: [() => toValue(key)] },
  )

  // Provide before awaiting: after an `await` the component instance is no longer current.
  const refs = computed(() => request.data.value?.refs ?? EMPTY_REFS)
  provideRefs(refs)

  await request
  if (request.error.value || !request.data.value) {
    throw createError({ statusCode: 404, message: 'Not found', fatal: true })
  }

  const entity = computed(() => (request.data.value as EntityResponse<EntityByKind[K]>).data)
  return { entity, refs }
}
