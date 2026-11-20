import { describe, expect, it } from 'vitest'
import { normalizeSearch, toKatakana } from '#shared/utils/kana'
import { padDexId, titleCase } from '#shared/utils/format'
import { pickAltName, pickName, pickText } from '#shared/utils/locales'

describe('kana helpers', () => {
  it('turns hiragana into katakana and leaves everything else alone', () => {
    expect(toKatakana('ぴかちゅう')).toBe('ピカチュウ')
    expect(toKatakana('ピカチュウ Pikachu 25')).toBe('ピカチュウ Pikachu 25')
  })

  it('makes different spellings of the same name comparable', () => {
    const forms = ['ピカチュウ', 'ぴかちゅう', 'ﾋﾟｶﾁｭｳ']
    expect(new Set(forms.map(normalizeSearch)).size).toBe(1)
    expect(normalizeSearch('Mr. Mime')).toBe(normalizeSearch('mr-mime'))
    expect(normalizeSearch('Farfetch’d')).toBe('farfetchd')
  })
})

describe('formatting', () => {
  it('title-cases slugs and pads dex numbers', () => {
    expect(titleCase('thunder-stone')).toBe('Thunder Stone')
    expect(padDexId(25)).toBe('#0025')
    expect(padDexId(1025)).toBe('#1025')
  })
})

describe('localized names and text', () => {
  const names = { en: 'Thunderbolt', ja: '10まんボルト' }

  it('picks the requested language and falls back to English', () => {
    expect(pickName(names, 'ja')).toBe('10まんボルト')
    expect(pickName({ en: 'Pound' }, 'ja')).toBe('Pound')
    expect(pickName(null, 'en')).toBe('')
  })

  it('offers the other language as a secondary name, once', () => {
    expect(pickAltName(names, 'en')).toBe('10まんボルト')
    expect(pickAltName(names, 'ja')).toBe('Thunderbolt')
    expect(pickAltName({ en: 'Pound' }, 'en')).toBeUndefined()
  })

  it('reports when text fell back to English', () => {
    expect(pickText({ en: 'Hello', ja: 'こんにちは' }, 'ja')).toEqual({ value: 'こんにちは', language: 'ja' })
    expect(pickText({ en: 'Hello' }, 'ja')).toEqual({ value: 'Hello', language: 'en' })
    expect(pickText({}, 'en')).toBeUndefined()
  })
})
