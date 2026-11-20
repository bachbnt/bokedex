import { describe, expect, it } from 'vitest'
import { flavorBy, names, textOf } from '#ingest/l10n'
import { buildRobots, buildSitemap } from '#ingest/build/seo'

const lang = (language: string, name: string) => ({ language: { name: language }, name })

describe('names', () => {
  it('collects English, Japanese, kana and romaji', () => {
    expect(names([lang('en', 'Pikachu'), lang('ja', 'ピカチュウ'), lang('ja-Hrkt', 'ピカチュウ'), lang('roomaji', 'Pikachu')], 'pikachu'))
      .toEqual({ en: 'Pikachu', ja: 'ピカチュウ', jaKana: 'ピカチュウ', jaRoma: 'Pikachu' })
  })

  it('uses the kana name when there is no kanji name, and the slug when there is no English', () => {
    expect(names([lang('ja-Hrkt', 'ひのこ')], 'ember')).toEqual({ en: 'Ember', ja: 'ひのこ', jaKana: 'ひのこ' })
  })

  it('writes full-width digits and letters as normal ones', () => {
    expect(names([lang('en', '10,000,000 Volt Thunderbolt'), lang('ja', '１０まんボルト')], 'catastropika').ja).toBe('10まんボルト')
  })
})

describe('text', () => {
  const entry = (language: string, flavor_text: string, version?: string) => ({ language: { name: language }, flavor_text, ...(version ? { version: { name: version } } : {}) })

  it('flattens line breaks and keeps both languages', () => {
    expect(textOf([entry('en', 'A line\nbreak.\fNext'), entry('ja', 'ちじょう\nＢ１４００メートル')])).toEqual({ en: 'A line break. Next', ja: 'ちじょうB1400メートル' })
  })

  it('takes the newest wording and drops entries with no text', () => {
    expect(textOf([entry('en', 'old'), entry('en', 'new')]).en).toBe('new')
    expect(textOf([])).toEqual({})
  })

  it('groups flavor text by game, preserving release order', () => {
    const grouped = flavorBy([entry('en', 'red text', 'red'), entry('ja', '赤', 'red'), entry('en', 'gold text', 'gold')], 'version')
    expect(grouped.map(group => group.key)).toEqual(['red', 'gold'])
    expect(grouped[0]?.text).toEqual({ en: 'red text', ja: '赤' })
  })
})

describe('sitemap', () => {
  const sitemap = buildSitemap('https://example.test/', ['/pokemon/25', '/moves/thunderbolt'])

  it('lists every page in every language with alternates', () => {
    expect(sitemap).toContain('<loc>https://example.test/pokemon/25</loc>')
    expect(sitemap).toContain('<loc>https://example.test/ja/pokemon/25</loc>')
    expect(sitemap).toContain('hreflang="ja" href="https://example.test/ja/moves/thunderbolt"')
    expect(sitemap).toContain('hreflang="x-default" href="https://example.test/"')
  })

  it('points robots.txt at the sitemap', () => {
    expect(buildRobots('https://example.test/')).toContain('Sitemap: https://example.test/sitemap.xml')
  })
})
