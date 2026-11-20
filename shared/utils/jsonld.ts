/**
 * schema.org structured data (JSON-LD) so search engines understand each page: what it is called, where it
 * sits in the site, and its image. The builders are plain functions so they can be tested without a browser.
 */

export type JsonLd = Record<string, unknown>

export interface Crumb {
  name: string
  url: string
}

export interface WebPageInput {
  url: string
  name: string
  alternateName?: string
  description?: string
  image?: string
  language: string
  siteUrl: string
  siteName: string
  crumbs: Crumb[]
}

export function breadcrumbList(crumbs: Crumb[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    'itemListElement': crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.name,
      'item': crumb.url,
    })),
  }
}

/** A page about one thing (a Pokémon, a move...), with its breadcrumb trail. */
export function webPage(input: WebPageInput): JsonLd {
  const about: JsonLd = { '@type': 'Thing', 'name': input.name }
  if (input.alternateName) about.alternateName = input.alternateName
  if (input.image) about.image = input.image
  if (input.description) about.description = input.description

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'url': input.url,
    'name': input.name,
    'inLanguage': input.language,
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { primaryImageOfPage: { '@type': 'ImageObject', 'url': input.image } } : {}),
    about,
    'breadcrumb': breadcrumbList(input.crumbs),
    'isPartOf': { '@type': 'WebSite', 'name': input.siteName, 'url': input.siteUrl },
  }
}

/** The site itself, with the search box search engines can offer. `searchUrl` contains `{search_term_string}`. */
export function webSite(input: { url: string, name: string, language: string, searchUrl: string }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'url': input.url,
    'name': input.name,
    'inLanguage': input.language,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': { '@type': 'EntryPoint', 'urlTemplate': input.searchUrl },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** JSON for a `<script type="application/ld+json">`; `<` is escaped so a name can never close the tag. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
