import { describe, expect, it } from 'vitest'
import { buildStats, defaultBuild, defensiveTypes, evTotal, normalizeBuild, offensiveTypes, withEv } from '~/utils/team-build'

describe('team builds', () => {
  it('starts at level 50 with perfect IVs and no EVs', () => {
    const build = defaultBuild()
    expect(build.level).toBe(50)
    expect(build.ivs.speed).toBe(31)
    expect(evTotal(build)).toBe(0)
  })

  it('repairs saved data: gaps are filled and numbers clamped', () => {
    const build = normalizeBuild({ level: 400, tera: '', ivs: { speed: -5 } as never, evs: { hp: 999, attack: 252, defense: 252 } as never })
    expect(build.level).toBe(100)
    expect(build.tera).toBeNull()
    expect(build.ivs.speed).toBe(0)
    expect(build.ivs.hp).toBe(31)
    expect(build.evs.hp).toBe(252)
    expect(evTotal(build)).toBeLessThanOrEqual(510)
  })

  it('accepts nothing at all', () => {
    expect(normalizeBuild(undefined)).toEqual(defaultBuild())
    expect(normalizeBuild(null)).toEqual(defaultBuild())
  })

  it('holds EVs to 252 per stat and 510 in total', () => {
    let build = withEv(defaultBuild(), 'attack', 300)
    expect(build.evs.attack).toBe(252)
    build = withEv(build, 'speed', 252)
    build = withEv(build, 'hp', 252)
    expect(build.evs.hp).toBe(6)
    expect(evTotal(build)).toBe(510)
    expect(withEv(build, 'attack', 0).evs.attack).toBe(0)
  })

  it('computes stats with the nature and EVs', () => {
    // Charizard base stats at level 50, perfect IVs, Adamant, 252 Attack EVs.
    const build = withEv({ ...defaultBuild(), nature: 'adamant' }, 'attack', 252)
    const stats = buildStats([78, 84, 78, 109, 85, 100], build, { increasedStat: 'attack', decreasedStat: 'special-attack' })
    expect(stats[0]).toBe(153)
    expect(stats[1]).toBe(Math.floor((Math.floor(((2 * 84 + 31 + 63) * 50) / 100) + 5) * 1.1))
    expect(stats[3]).toBe(Math.floor((Math.floor(((2 * 109 + 31) * 50) / 100) + 5) * 0.9))
  })

  it('treats a Tera type as replacing the defensive typing and adding an attacking type', () => {
    expect(defensiveTypes(['fire', 'flying'], 'water')).toEqual(['water'])
    expect(defensiveTypes(['fire', 'flying'], null)).toEqual(['fire', 'flying'])
    expect(offensiveTypes(['fire', 'flying'], 'water')).toEqual(['fire', 'flying', 'water'])
    expect(offensiveTypes(['fire', 'flying'], 'fire')).toEqual(['fire', 'flying'])
  })
})
