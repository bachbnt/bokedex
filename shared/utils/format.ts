/** "thunder-stone" -> "Thunder Stone" */
export function titleCase(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** 25 -> "#0025" */
export function padDexId(id: number): string {
  return `#${String(id).padStart(4, '0')}`
}
