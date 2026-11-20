import type { TypeInfo } from '#shared/types/pokedex'

export type Multiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4

export interface DefenseGroups {
  quadruple: string[]
  double: string[]
  half: string[]
  quarter: string[]
  immune: string[]
}

/** Type effectiveness derived from PokeAPI damage relations — no hardcoded chart. */
export function useTypeChart() {
  const { data, status, error } = useFetch<TypeInfo[]>('/api/types.json', { key: 'types', default: () => [] })

  const types = computed(() => (data.value ?? []).map(type => type.name))

  /** attacker -> defender -> multiplier for a single defending type. */
  const matrix = computed(() => {
    const result = new Map<string, Map<string, number>>()
    for (const { name, relations } of data.value ?? []) {
      const row = new Map<string, number>()
      for (const defender of types.value) row.set(defender, 1)
      for (const defender of relations.doubleTo) row.set(defender, 2)
      for (const defender of relations.halfTo) row.set(defender, 0.5)
      for (const defender of relations.noTo) row.set(defender, 0)
      result.set(name, row)
    }
    return result
  })

  /** Damage multiplier of one attacking type against a (possibly dual-typed) defender. */
  function effectiveness(attacker: string, defenders: string[]): number {
    const row = matrix.value.get(attacker)
    if (!row) return 1
    return defenders.reduce((product, defender) => product * (row.get(defender) ?? 1), 1)
  }

  /** How every attacking type fares against the given defending types. */
  function defenseProfile(defenders: string[]): Record<string, number> {
    return Object.fromEntries(types.value.map(attacker => [attacker, effectiveness(attacker, defenders)]))
  }

  function groupDefense(defenders: string[]): DefenseGroups {
    const groups: DefenseGroups = { quadruple: [], double: [], half: [], quarter: [], immune: [] }
    for (const [attacker, multiplier] of Object.entries(defenseProfile(defenders))) {
      if (multiplier === 0) groups.immune.push(attacker)
      else if (multiplier >= 4) groups.quadruple.push(attacker)
      else if (multiplier >= 2) groups.double.push(attacker)
      else if (multiplier <= 0.25) groups.quarter.push(attacker)
      else if (multiplier < 1) groups.half.push(attacker)
    }
    return groups
  }

  /** Types that the given attacking types hit for super-effective damage. */
  function coverage(attackers: string[]): Set<string> {
    const covered = new Set<string>()
    for (const defender of types.value) {
      if (attackers.some(attacker => effectiveness(attacker, [defender]) >= 2)) covered.add(defender)
    }
    return covered
  }

  return { data, status, error, types, matrix, effectiveness, defenseProfile, groupDefense, coverage }
}
