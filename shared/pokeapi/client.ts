/**
 * Minimal PokeAPI client built on the standard `fetch`, so the same code runs in Node
 * (when the dex snapshot is built) and in the browser (when a Pokémon's details load).
 */
import type { Localized } from '#shared/pokeapi/types'

const CONCURRENCY = 8
const RETRIES = 2
const RETRY_DELAY_MS = 400
const TIMEOUT_MS = 15_000
const HTTP_TOO_MANY_REQUESTS = 429
const HTTP_SERVER_ERROR = 500

export class PokeApiError extends Error {
  constructor(message: string, readonly status: number | null = null) {
    super(message)
    this.name = 'PokeApiError'
  }
}

export interface PokeApi {
  /** Fetch a resource by path (`pokemon/25`) or by the full url PokeAPI hands back inside payloads. */
  get: <T>(pathOrUrl: string) => Promise<T>
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

/** A 404 will never succeed on retry; rate limits, 5xx and network failures might. */
const isRetryable = (error: unknown) =>
  !(error instanceof PokeApiError)
  || error.status === null
  || error.status === HTTP_TOO_MANY_REQUESTS
  || error.status >= HTTP_SERVER_ERROR

export function createPokeApi(baseUrl: string): PokeApi {
  const root = baseUrl.replace(/\/$/, '')

  async function get<T>(pathOrUrl: string): Promise<T> {
    const url = /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${root}/${pathOrUrl.replace(/^\//, '')}`
    let lastError: unknown

    for (let attempt = 0; attempt <= RETRIES; attempt++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
        if (!response.ok) throw new PokeApiError(`PokeAPI responded ${response.status} for ${url}`, response.status)
        return await response.json() as T
      }
      catch (error) {
        lastError = error
        if (attempt === RETRIES || !isRetryable(error)) break
        await sleep(RETRY_DELAY_MS * (attempt + 1))
      }
    }

    throw lastError instanceof PokeApiError ? lastError : new PokeApiError(`Could not reach PokeAPI for ${url}`)
  }

  return { get }
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

/** Remember each key's promise so repeat lookups are instant; a failure is forgotten so it can be retried. */
export function memoizeAsync<K, V>(load: (key: K) => Promise<V>): (key: K) => Promise<V> {
  const cache = new Map<K, Promise<V>>()
  return (key) => {
    let hit = cache.get(key)
    if (!hit) {
      hit = load(key).catch((error: unknown) => {
        cache.delete(key)
        throw error
      })
      cache.set(key, hit)
    }
    return hit
  }
}
