import type { DexEntry } from '#shared/types/encyclopedia'

export interface DefenseRow {
  type: string
  weak: number
  resist: number
  /** Weaknesses outnumber resistances: a real hole in the team. */
  risky: boolean
}

/** Turns a list of team members into defensive holes and offensive coverage. */
export function useTeamAnalysis(members: MaybeRefOrGetter<DexEntry[]>) {
  const { types, effectiveness, coverage } = useTypeChart()

  const defense = computed<DefenseRow[]>(() => {
    const team = toValue(members)
    return types.value.map((attacker) => {
      let weak = 0
      let resist = 0
      for (const member of team) {
        const multiplier = effectiveness(attacker, member.types)
        if (multiplier > 1) weak++
        else if (multiplier < 1) resist++
      }
      return { type: attacker, weak, resist, risky: weak > resist }
    })
  })

  // STAB coverage: the member's own types are what they hit hardest with.
  const covered = computed(() => coverage([...new Set(toValue(members).flatMap(member => member.types))]))
  const uncovered = computed(() => types.value.filter(type => !covered.value.has(type)))

  return { defense, covered, uncovered }
}
