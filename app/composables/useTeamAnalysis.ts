import { defensiveTypes, offensiveTypes } from '~/utils/team-build'

export interface AnalysedMember {
  types: string[]
  /** Tera type, if the member has one: it replaces the defensive typing and adds an attacking type. */
  tera?: string | null
}

export interface DefenseRow {
  type: string
  weak: number
  resist: number
  /** Weaknesses outnumber resistances: a real hole in the team. */
  risky: boolean
}

/** Turns a list of team members into defensive holes and offensive coverage. */
export function useTeamAnalysis(members: MaybeRefOrGetter<AnalysedMember[]>) {
  const { types, effectiveness, coverage } = useTypeChart()

  const defense = computed<DefenseRow[]>(() => {
    const team = toValue(members)
    return types.value.map((attacker) => {
      let weak = 0
      let resist = 0
      for (const member of team) {
        const multiplier = effectiveness(attacker, defensiveTypes(member.types, member.tera ?? null))
        if (multiplier > 1) weak++
        else if (multiplier < 1) resist++
      }
      return { type: attacker, weak, resist, risky: weak > resist }
    })
  })

  // STAB coverage: the member's own types (and its Tera type) are what they hit hardest with.
  const covered = computed(() => coverage([...new Set(toValue(members).flatMap(member => offensiveTypes(member.types, member.tera ?? null)))]))
  const uncovered = computed(() => types.value.filter(type => !covered.value.has(type)))

  return { defense, covered, uncovered }
}
