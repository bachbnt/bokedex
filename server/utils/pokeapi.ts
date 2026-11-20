/**
 * Thin PokeAPI client. All upstream calls go through here so retry, base URL
 * and caching live in exactly one place.
 */
import type { Localized } from '#server/types/pokeapi'

const CONCURRENCY = 8

export function pokeFetch<T>(path: string): Promise<T> {
  const { pokeApiBase } = useRuntimeConfig()
  // Nitro's typed $fetch can't infer a response for an arbitrary path; the caller supplies T.
  return $fetch(path, {
    baseURL: pokeApiBase,
    retry: 2,
    retryDelay: 400,
    timeout: 15_000,
  }) as Promise<T>
}

/** Resolve a resource from a full PokeAPI url (as returned inside payloads). */
export function pokeFetchUrl<T>(url: string): Promise<T> {
  const { pokeApiBase } = useRuntimeConfig()
  return pokeFetch<T>(url.replace(pokeApiBase, '').replace(/^\//, ''))
}

/** Last numeric segment of a PokeAPI url: `.../pokemon/25/` -> 25. */
export function idFromUrl(url: string): number {
  return Number(url.replace(/\/$/, '').split('/').pop())
}

/** Promise.all with a ceiling, so we stay a polite client of a free API. */
export async function mapLimit<T, R>(items: readonly T[], fn: (item: T) => Promise<R>, limit = CONCURRENCY): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await fn(items[index]!)
    }
  })
  await Promise.all(workers)
  return results
}

export function englishText<T extends Localized>(entries: T[] | undefined): T | undefined {
  return entries?.find(entry => entry.language.name === 'en')
}

export function cleanText(text: string): string {
  return text.replace(/[\f\n\r]+/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Cache lifetime for upstream data, configurable via runtimeConfig. */
export function cacheOptions(name: string) {
  const { cacheMaxAge } = useRuntimeConfig()
  return { name, maxAge: Number(cacheMaxAge), swr: true, staleMaxAge: Number(cacheMaxAge) * 7 }
}
