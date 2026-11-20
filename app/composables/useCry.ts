/** Plays a Pokémon cry. Audio is created lazily so SSR and first paint stay untouched. */
export function useCry() {
  const playing = ref(false)
  let audio: HTMLAudioElement | null = null

  function play(url: string | null | undefined) {
    if (!url || !import.meta.client) return
    audio?.pause()
    audio = new Audio(url)
    audio.volume = 0.5
    audio.onended = () => { playing.value = false }
    audio.onerror = () => { playing.value = false }
    playing.value = true
    audio.play().catch(() => { playing.value = false })
  }

  onBeforeUnmount(() => audio?.pause())

  return { playing, play }
}
