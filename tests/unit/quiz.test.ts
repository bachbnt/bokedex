import { describe, expect, it } from 'vitest'
import type { AbilityRow, PokemonRow } from '#shared/types/encyclopedia'
import { createAbilityQuestion, createNameMatch, createStatDuel, OPTION_COUNT, statDuelWinner, statValue } from '~/utils/quiz'

const row = (id: number, stats: number[], abilities: string[], ja: string | null = `ポケ${id}`): PokemonRow => ({
  id,
  slug: `p${id}`,
  names: { en: `P${id}`, ...(ja ? { ja } : {}) },
  types: ['normal'],
  gen: 1,
  stats,
  statTotal: stats.reduce((a, b) => a + b, 0),
  abilities,
  color: null, shape: null, habitat: null, eggGroups: [], growthRate: null,
  isLegendary: false, isMythical: false, isBaby: false, formCount: 1,
})

const rows = Array.from({ length: 12 }, (_, index) => row(index + 1, [40 + index, 50 + index, 45 + index * 3, 48 + index * 4, 55 + index, 60 + index * 2], index % 2 ? ['static'] : ['overgrow', 'chlorophyll']))
const abilities: AbilityRow[] = ['static', 'overgrow', 'chlorophyll', 'unused'].map((slug, index) => ({ id: index, slug, names: { en: slug }, generation: 3, shortEffect: {}, pokemonCount: 1 }))

describe('stat duel', () => {
  it('reads each stat and the total', () => {
    const pokemon = row(1, [10, 20, 30, 40, 50, 60], [])
    expect(statValue(pokemon, 'hp')).toBe(10)
    expect(statValue(pokemon, 'speed')).toBe(60)
    expect(statValue(pokemon, 'total')).toBe(210)
  })

  it('never offers a tie when a different pair exists', () => {
    for (let i = 0; i < 50; i++) {
      const question = createStatDuel(rows)
      expect(statValue(question.a, question.stat)).not.toBe(statValue(question.b, question.stat))
      const winner = statDuelWinner(question) === 'a' ? question.a : question.b
      const loser = winner === question.a ? question.b : question.a
      expect(statValue(winner, question.stat)).toBeGreaterThan(statValue(loser, question.stat))
    }
  })
})

describe('name match', () => {
  it('offers the answer once among distinct options', () => {
    const question = createNameMatch(rows)
    expect(question.options).toHaveLength(OPTION_COUNT)
    expect(question.options.filter(option => option.id === question.answer.id)).toHaveLength(1)
    expect(new Set(question.options.map(option => option.id)).size).toBe(OPTION_COUNT)
  })

  it('skips Pokémon without a Japanese name', () => {
    const mixed = [...rows.slice(0, 5), row(99, [1, 1, 1, 1, 1, 1], [], null)]
    for (let i = 0; i < 30; i++) expect(createNameMatch(mixed).options.every(option => option.id !== 99)).toBe(true)
  })
})

describe('ability check', () => {
  it('has exactly one Pokémon with the ability among the options', () => {
    for (let i = 0; i < 50; i++) {
      const question = createAbilityQuestion(rows, abilities)
      expect(question.ability.slug).not.toBe('unused')
      const withAbility = question.options.filter(option => option.abilities.includes(question.ability.slug))
      expect(withAbility.map(option => option.id)).toEqual([question.answer.id])
      expect(question.options).toHaveLength(OPTION_COUNT)
    }
  })
})
