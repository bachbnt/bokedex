import type { Taxonomy } from '#shared/types/encyclopedia'

/**
 * Lets a list page label categories (damage class, item category, ...) the same way entity pages do:
 * loads the small taxonomy table and provides it as `refs` to every component below the page.
 *
 * Vue does not let a component inject what it provides itself, so the page's own `useLabels()` needs
 * the returned `refs` passed in: `useLabels(refs)`.
 */
export function useTaxonomyRefs() {
  const { data: taxonomy } = useDataset<Taxonomy>('taxonomy')
  const refs = computed(() => ({ ...EMPTY_REFS, taxonomy: taxonomy.value ?? {} }))
  provideRefs(refs)
  return { taxonomy, refs }
}
