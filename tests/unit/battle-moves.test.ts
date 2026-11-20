import { describe, expect, it } from 'vitest'
import { battleMovesOf, isBattleMove, maxMovePower, MAX_BANDS, MAX_MOVE_BY_TYPE, Z_BANDS, Z_MOVE_BY_TYPE, zMovePower } from '#shared/utils/battle-moves'

describe('Z-Move power', () => {
  it.each([[40, 100], [55, 100], [60, 120], [75, 140], [85, 160], [90, 175], [100, 180], [110, 185], [120, 190], [130, 195], [140, 200], [250, 200]])(
    'turns base power %i into %i', (base, expected) => expect(zMovePower(base)).toBe(expected),
  )

  it('agrees with the table shown on the reference page', () => {
    for (const band of Z_BANDS) expect(zMovePower(Number.isFinite(band.upTo) ? band.upTo : 300)).toBe(band.power)
  })
})

describe('Max Move power', () => {
  it.each([[40, 'fire', 90], [50, 'water', 100], [90, 'grass', 130], [120, 'ice', 140], [150, 'dark', 150]])(
    'turns base power %i of %s into %i', (base, type, expected) => expect(maxMovePower(base, type)).toBe(expected),
  )

  it('scales Fighting and Poison lower', () => {
    expect(maxMovePower(90, 'fighting')).toBe(90)
    expect(maxMovePower(90, 'poison')).toBe(90)
    expect(maxMovePower(40, 'fighting')).toBe(70)
    expect(maxMovePower(130, 'poison')).toBe(100)
  })

  it('agrees with the table shown on the reference page', () => {
    for (const band of MAX_BANDS) {
      const base = Number.isFinite(band.upTo) ? band.upTo : 300
      expect(maxMovePower(base, 'fire')).toBe(band.power)
      expect(maxMovePower(base, 'fighting')).toBe(band.powerLow)
    }
  })
})

describe('battleMovesOf', () => {
  it('names the Z-Move and Max Move of a damaging move by its type and class', () => {
    expect(battleMovesOf({ slug: 'thunderbolt', type: 'electric', damageClass: 'special', power: 90 })).toEqual({
      z: { slug: 'gigavolt-havoc--special', power: 175 },
      max: { slug: 'max-lightning', power: 130 },
    })
  })

  it('has nothing for status moves or moves without power', () => {
    expect(battleMovesOf({ slug: 'growl', type: 'normal', damageClass: 'status', power: null })).toBeNull()
    expect(battleMovesOf({ slug: 'counter', type: 'fighting', damageClass: 'physical', power: null })).toBeNull()
  })

  it('does not convert the Z-Moves and Max Moves themselves', () => {
    expect(isBattleMove('max-flare')).toBe(true)
    expect(isBattleMove('inferno-overdrive--physical')).toBe(true)
    expect(isBattleMove('catastropika')).toBe(true)
    expect(isBattleMove('flamethrower')).toBe(false)
    expect(battleMovesOf({ slug: 'max-flare', type: 'fire', damageClass: 'physical', power: 100 })).toBeNull()
  })

  it('covers the same types for both mechanics', () => {
    expect(Object.keys(Z_MOVE_BY_TYPE).toSorted()).toEqual(Object.keys(MAX_MOVE_BY_TYPE).toSorted())
  })
})
