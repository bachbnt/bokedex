/**
 * Pointer-driven 3D tilt that writes CSS variables onto an element.
 * The visual effect itself lives in `.holo` (main.css); this only feeds it numbers.
 */
export function useTilt(maxDegrees = 9) {
  const el = ref<HTMLElement | null>(null)
  const supportsHover = import.meta.client && window.matchMedia('(hover: hover)').matches

  function onMove(event: PointerEvent) {
    const node = el.value
    if (!node || !supportsHover) return
    const rect = node.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    node.style.setProperty('--ry', `${(x - 0.5) * 2 * maxDegrees}deg`)
    node.style.setProperty('--rx', `${(0.5 - y) * 2 * maxDegrees}deg`)
    node.style.setProperty('--mx', `${x * 100}%`)
    node.style.setProperty('--my', `${y * 100}%`)
    node.dataset.active = 'true'
  }

  function reset() {
    const node = el.value
    if (!node) return
    node.style.setProperty('--rx', '0deg')
    node.style.setProperty('--ry', '0deg')
    node.dataset.active = 'false'
  }

  return { el, onMove, reset }
}
