import { skipHydrate } from 'pinia'

export const TEAM_SIZE = 6

/** The player's favorites and team. Persisted locally; hydrated after mount to keep SSR markup stable. */
export const useCollectionStore = defineStore('collection', () => {
  const favorites = useLocalStorage<number[]>('bokedex:favorites', [], { initOnMounted: true })
  const team = useLocalStorage<number[]>('bokedex:team', [], { initOnMounted: true })

  const isFavorite = (id: number) => favorites.value.includes(id)
  const inTeam = (id: number) => team.value.includes(id)
  const isTeamFull = computed(() => team.value.length >= TEAM_SIZE)

  function toggleFavorite(id: number) {
    favorites.value = isFavorite(id)
      ? favorites.value.filter(value => value !== id)
      : [...favorites.value, id]
  }

  function addToTeam(id: number): boolean {
    if (inTeam(id) || isTeamFull.value) return false
    team.value = [...team.value, id]
    return true
  }

  function removeFromTeam(id: number) {
    team.value = team.value.filter(value => value !== id)
  }

  function toggleTeam(id: number) {
    if (inTeam(id)) removeFromTeam(id)
    else addToTeam(id)
  }

  function setTeam(ids: number[]) {
    team.value = ids.slice(0, TEAM_SIZE)
  }

  function clearTeam() {
    team.value = []
  }

  return {
    // skipHydrate: these refs own their persistence (localStorage). Without it, Pinia would assign the
    // server's empty state during hydration, which VueUse then writes back over the saved data.
    favorites: skipHydrate(favorites),
    team: skipHydrate(team),
    isFavorite,
    inTeam,
    isTeamFull,
    toggleFavorite,
    addToTeam,
    removeFromTeam,
    toggleTeam,
    setTeam,
    clearTeam,
  }
})
