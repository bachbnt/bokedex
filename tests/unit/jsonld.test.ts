import { describe, expect, it } from 'vitest'
import { breadcrumbList, serializeJsonLd, webPage, webSite } from '#shared/utils/jsonld'

const site = { siteUrl: 'https://example.test', siteName: 'Bokedex' }

describe('structured data', () => {
  it('numbers a breadcrumb trail from 1', () => {
    const list = breadcrumbList([{ name: 'Home', url: 'https://example.test/' }, { name: 'Moves', url: 'https://example.test/moves' }]) as { itemListElement: { position: number, item: string }[] }
    expect(list.itemListElement.map(entry => entry.position)).toEqual([1, 2])
    expect(list.itemListElement[1]?.item).toBe('https://example.test/moves')
  })

  it('describes a page about one thing, leaving out what is missing', () => {
    const page = webPage({ ...site, url: 'https://example.test/moves/thunderbolt', name: 'Thunderbolt', language: 'en', crumbs: [] })
    expect(page['@type']).toBe('WebPage')
    expect(page.name).toBe('Thunderbolt')
    expect(page.inLanguage).toBe('en')
    expect(page).not.toHaveProperty('description')
    expect(page).not.toHaveProperty('primaryImageOfPage')
    expect(page.about).toEqual({ '@type': 'Thing', 'name': 'Thunderbolt' })
  })

  it('includes the other-language name, image and description when given', () => {
    const page = webPage({ ...site, url: 'u', name: 'Pikachu', alternateName: 'ピカチュウ', description: 'Mouse', image: 'https://img.test/25.png', language: 'en', crumbs: [] })
    expect(page.about).toMatchObject({ alternateName: 'ピカチュウ', image: 'https://img.test/25.png', description: 'Mouse' })
    expect(page.primaryImageOfPage).toEqual({ '@type': 'ImageObject', 'url': 'https://img.test/25.png' })
  })

  it('describes the site with a search box', () => {
    const data = webSite({ url: 'https://example.test/', name: 'Bokedex', language: 'ja', searchUrl: 'https://example.test/?q={search_term_string}' }) as { potentialAction: { target: { urlTemplate: string } } }
    expect(data.potentialAction.target.urlTemplate).toContain('{search_term_string}')
  })

  it('cannot be used to close the script tag', () => {
    const json = serializeJsonLd({ name: '</script><script>alert(1)</script>' })
    expect(json).not.toContain('<')
    expect(JSON.parse(json).name).toBe('</script><script>alert(1)</script>')
  })
})
