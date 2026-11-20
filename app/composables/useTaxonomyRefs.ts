import type { Taxonomy } from '#shared/types/encyclopedia'

/**
 * Lets a list page label categories (damage class, item category, ...) the same way entity pages do:
 * loads the small taxonomy table and provides it as `refs` to everything below.
 */
export function useTaxonomyRefs() {
  const { data } = useDataset<Taxonomy>('taxonomy')
  provideRefs(computed(() => ({ ...EMPTY_REFS, taxonomy: data.value ?? {} })))
  return data
}
