import { describe, expect, it } from 'vitest'
import type { DexEntry } from '#shared/types/encyclopedia'
import { filterDex, matchesQuery, pickOfTheDay } from '~/utils/dex'

const dex: DexEntry[] = [
  { id: 1, slug: 'bulbasaur', names: { en: 'Bulbasaur', ja: 'フシギダネ', jaKana: 'フシギダネ', jaRoma: 'Fushigidane' }, types: ['grass', 'poison'], gen: 1 },
  { id: 4, slug: 'charmander', names: { en: 'Charmander', ja: 'ヒトカゲ', jaKana: 'ヒトカゲ', jaRoma: 'Hitokage' }, types: ['fire'], gen: 1 },
  { id: 25, slug: 'pikachu', names: { en: 'Pikachu', ja: 'ピカチュウ', jaKana: 'ピカチュウ', jaRoma: 'Pikachu' }, types: ['electric'], gen: 1 },
  { id: 152, slug: 'chikorita', names: { en: 'Chikorita', ja: 'チコリータ' }, types: ['grass'], gen: 2 },
  { id: 122, slug: 'mr-mime', names: { en: 'Mr. Mime', ja: 'バリヤード' }, types: ['psychic', 'fairy'], gen: 1 },
]

const base = { query: '', type: '', gen: 0, onlyFavorites: false, favorites: [], sort: 'id-asc' as const, locale: 'en' as const }

describe('matchesQuery', () => {
  const pikachu = dex[2]!

  it('matches English, katakana, hiragana and romaji', () => {
    for (const query of ['pika', 'PIKACHU', 'ピカ', 'ぴか', 'ぴかちゅう']) expect(matchesQuery(pikachu, query)).toBe(true)
    expect(matchesQuery(dex[0]!, 'fushigi')).toBe(true)
  })

  it('matches by number, with or without # and padding', () => {
    for (const query of ['25', '#25', '#0025']) expect(matchesQuery(pikachu, query)).toBe(true)
    expect(matchesQuery(pikachu, '26')).toBe(false)
  })

  it('ignores punctuation in names', () => {
    expect(matchesQuery(dex[4]!, 'mr mime')).toBe(true)
    expect(matchesQuery(dex[4]!, 'mrmime')).toBe(true)
  })

  it('treats an empty query as everything', () => {
    expect(dex.every(entry => matchesQuery(entry, '  '))).toBe(true)
  })
})

describe('filterDex', () => {
  it('filters by type and generation together', () => {
    expect(filterDex(dex, { ...base, type: 'grass' }).map(entry => entry.id)).toEqual([1, 152])
    expect(filterDex(dex, { ...base, type: 'grass', gen: 2 }).map(entry => entry.id)).toEqual([152])
  })

  it('restricts to favorites', () => {
    expect(filterDex(dex, { ...base, onlyFavorites: true, favorites: [4, 25] }).map(entry => entry.id)).toEqual([4, 25])
  })

  it('sorts by number and by the name in the visitor language', () => {
    expect(filterDex(dex, { ...base, sort: 'id-desc' }).map(entry => entry.id)).toEqual([152, 122, 25, 4, 1])
    expect(filterDex(dex, { ...base, sort: 'name' }).map(entry => entry.slug)).toEqual(['bulbasaur', 'charmander', 'chikorita', 'mr-mime', 'pikachu'])
    expect(filterDex(dex, { ...base, sort: 'name', locale: 'ja' }).map(entry => entry.names.ja)).toEqual(['ヒトカゲ', 'フシギダネ', 'チコリータ', 'ピカチュウ', 'バリヤード'].toSorted((a, b) => a.localeCompare(b, 'ja')))
  })

  it('does not mutate its input', () => {
    const before = dex.map(entry => entry.id)
    filterDex(dex, { ...base, sort: 'id-desc' })
    expect(dex.map(entry => entry.id)).toEqual(before)
  })
})

describe('pickOfTheDay', () => {
  it('is stable within a day and handles an empty list', () => {
    const morning = new Date('2026-11-20T01:00:00Z')
    const evening = new Date('2026-11-20T23:00:00Z')
    expect(pickOfTheDay(dex, morning)).toBe(pickOfTheDay(dex, evening))
    expect(pickOfTheDay([], morning)).toBeUndefined()
  })
})
