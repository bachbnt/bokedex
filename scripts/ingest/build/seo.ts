import { LANGUAGE_PREFIXES, STATIC_ROUTES, withLanguages } from '#shared/utils/routes'

const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Language code for each URL prefix; English is the unprefixed default. */
const LANGUAGE_CODES = ['en', ...LANGUAGE_PREFIXES.map(prefix => prefix.slice(1))]

/**
 * A sitemap listing every page in every language, each entry pointing at its translations
 * so search engines show the right language to the right visitor.
 */
export function buildSitemap(siteUrl: string, entityRoutes: string[]): string {
  const base = siteUrl.replace(/\/$/, '')
  const urls = [...STATIC_ROUTES, ...entityRoutes].flatMap((route) => {
    const variants = withLanguages(route)
    const alternates = variants
      .map((path, index) => `    <xhtml:link rel="alternate" hreflang="${LANGUAGE_CODES[index]}" href="${escapeXml(base + path)}"/>`)
      .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(base + variants[0])}"/>`)
      .join('\n')
    return variants.map(path => `  <url>\n    <loc>${escapeXml(base + path)}</loc>\n${alternates}\n  </url>`)
  })

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
}

export function buildRobots(siteUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl.replace(/\/$/, '')}/sitemap.xml\n`
}
