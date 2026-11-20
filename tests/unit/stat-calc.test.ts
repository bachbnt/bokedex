import { describe, expect, it } from 'vitest'
import { calcStat, natureMultiplier } from '~/utils/stat-calc'

describe('calcStat', () => {
  it('computes HP and other stats the way the games do', () => {
    // Charizard at level 50, perfect IVs, no EVs.
    expect(calcStat({ stat: 'hp', base: 78, level: 50, iv: 31, ev: 0 })).toBe(153)
    expect(calcStat({ stat: 'attack', base: 84, level: 50, iv: 31, ev: 0 })).toBe(104)
  })

  it('applies EVs in groups of four', () => {
    expect(calcStat({ stat: 'speed', base: 100, level: 100, iv: 31, ev: 252 })).toBe(299)
    expect(calcStat({ stat: 'speed', base: 100, level: 100, iv: 31, ev: 255 })).toBe(299)
  })

  it('applies the nature after rounding down', () => {
    expect(calcStat({ stat: 'attack', base: 84, level: 50, iv: 31, ev: 0, multiplier: 1.1 })).toBe(114)
    expect(calcStat({ stat: 'attack', base: 84, level: 50, iv: 31, ev: 0, multiplier: 0.9 })).toBe(93)
  })

  it('gives Shedinja 1 HP', () => {
    expect(calcStat({ stat: 'hp', base: 1, level: 100, iv: 31, ev: 252, shedinja: true })).toBe(1)
  })
})

describe('natureMultiplier', () => {
  it('raises, lowers or leaves a stat', () => {
    expect(natureMultiplier('attack', 'attack', 'speed')).toBe(1.1)
    expect(natureMultiplier('speed', 'attack', 'speed')).toBe(0.9)
    expect(natureMultiplier('defense', 'attack', 'speed')).toBe(1)
  })

  it('treats neutral natures as no change', () => {
    expect(natureMultiplier('attack', null, null)).toBe(1)
    expect(natureMultiplier('attack', 'attack', 'attack')).toBe(1)
  })
})
