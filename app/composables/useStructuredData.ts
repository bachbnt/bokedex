import { serializeJsonLd, webPage, webSite } from '#shared/utils/jsonld'

/** Where each kind of entity sits in the site: its list page and that page's menu label. */
const SECTIONS = {
  pokemon: { path: '/', label: 'nav.pokedex' },
  moves: { path: '/moves', label: 'nav.moves' },
  abilities: { path: '/abilities', label: 'nav.abilities' },
  items: { path: '/items', label: 'nav.items' },
  locations: { path: '/locations', label: 'nav.locations' },
  types: { path: '/types', label: 'nav.types' },
  regions: { path: '/regions', label: 'nav.regions' },
  games: { path: '/games', label: 'nav.games' },
  pokedex: { path: '/pokedex', label: 'nav.pokedexes' },
  generations: { path: '/generations', label: 'nav.generations' },
  eggGroups: { path: '/egg-groups', label: 'nav.eggGroups' },
} as const

export type SchemaSection = keyof typeof SECTIONS

interface EntitySchemaOptions {
  name: MaybeRefOrGetter<string>
  alternateName?: MaybeRefOrGetter<string | undefined>
  description?: MaybeRefOrGetter<string | undefined>
  image?: MaybeRefOrGetter<string | undefined>
}

const jsonLdScript = (data: Parameters<typeof serializeJsonLd>[0]) => ({ type: 'application/ld+json' as const, innerHTML: serializeJsonLd(data) })

/** Adds a WebPage with its breadcrumb trail (Home, section, this page) to an entity page. */
export function useEntitySchema(section: SchemaSection, options: EntitySchemaOptions) {
  const { t, locale } = useI18n()
  const route = useRoute()
  const localePath = useLocalePath()
  const { siteUrl } = useRuntimeConfig().public

  useHead(() => {
    const target = SECTIONS[section]
    const name = toValue(options.name)
    const crumbs = [
      { name: 'Bokedex', url: `${siteUrl}${localePath('/')}` },
      { name: t(target.label), url: `${siteUrl}${localePath(target.path)}` },
      { name, url: `${siteUrl}${route.path}` },
    ]
    return {
      script: [jsonLdScript(webPage({
        url: `${siteUrl}${route.path}`,
        name,
        alternateName: toValue(options.alternateName),
        description: toValue(options.description),
        image: toValue(options.image),
        language: locale.value,
        siteUrl,
        siteName: 'Bokedex',
        crumbs,
      }))],
    }
  })
}

/** The site-wide WebSite entry with its search box; used on the home page. */
export function useSiteSchema() {
  const { locale } = useI18n()
  const localePath = useLocalePath()
  const { siteUrl } = useRuntimeConfig().public

  useHead(() => {
    const home = `${siteUrl}${localePath('/')}`
    return {
      script: [jsonLdScript(webSite({
        url: home,
        name: 'Bokedex',
        language: locale.value,
        searchUrl: `${home}?q={search_term_string}`,
      }))],
    }
  })
}
