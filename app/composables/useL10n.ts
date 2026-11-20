import type { InjectionKey, Ref } from 'vue'
import type { Locale, Names, Refs, TaxonomyKind, Text, TypeRow } from '#shared/types/encyclopedia'

/** Always-available data every page needs (type names), carried once per page in the payload. */
interface CoreData {
  types: Record<string, Names>
}

export const EMPTY_REFS: Refs = { pokemon: {}, moves: {}, abilities: {}, items: {}, locations: {}, taxonomy: {} }
const REFS_KEY: InjectionKey<Ref<Refs>> = Symbol('refs')

/** Entity pages hand the rows they reference to every component below them. */
export function provideRefs(refs: Ref<Refs>) {
  provide(REFS_KEY, refs)
}

export function useRefs(): Ref<Refs> {
  return inject(REFS_KEY, ref(EMPTY_REFS))
}

/** The current language and the helpers that turn bilingual data into display strings. */
export function useL10n() {
  const { locale } = useI18n()
  const current = computed<Locale>(() => (isLocale(locale.value) ? locale.value : DEFAULT_LOCALE))

  return {
    locale: current,
    name: (names: Names | null | undefined) => pickName(names, current.value),
    altName: (names: Names | null | undefined) => pickAltName(names, current.value),
    text: (value: Text | null | undefined) => pickText(value, current.value),
  }
}

/** Names of the things a page mentions: types, Pokémon, moves, categories... Falls back to the slug. */
export function useLabels() {
  const { name } = useL10n()
  const refs = useRefs()
  const core = useState<CoreData | null>('core', () => null)

  return {
    type: (slug: string) => {
      const names = core.value?.types[slug]
      return names ? name(names) : titleCase(slug)
    },
    taxonomy: (kind: TaxonomyKind, slug: string | null | undefined) => {
      if (!slug) return ''
      const names = refs.value.taxonomy[kind]?.[slug]
      return names ? name(names) : titleCase(slug)
    },
    pokemon: (id: number) => {
      const entry = refs.value.pokemon[id]
      return entry ? name(entry.names) : padDexId(id)
    },
    move: (slug: string) => {
      const row = refs.value.moves[slug]
      return row ? name(row.names) : titleCase(slug)
    },
    ability: (slug: string) => {
      const row = refs.value.abilities[slug]
      return row ? name(row.names) : titleCase(slug)
    },
    item: (slug: string) => {
      const row = refs.value.items[slug]
      return row ? name(row.names) : titleCase(slug)
    },
    location: (slug: string) => {
      const row = refs.value.locations[slug]
      return row ? name(row.names) : titleCase(slug)
    },
  }
}

/** Type names for every type, loaded once at build time (prerender) and then carried in the payload. */
export function useCoreData() {
  return useState<CoreData | null>('core', () => null)
}

export async function loadCoreData(): Promise<CoreData> {
  const rows = await $fetch<TypeRow[]>(datasetUrl('types'))
  return { types: Object.fromEntries(rows.map(row => [row.slug, row.names])) }
}
