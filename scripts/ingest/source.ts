import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const REPO_URL = 'https://github.com/PokeAPI/api-data'

/** Where the PokeAPI data mirror lives. Override with `API_DATA_DIR` to reuse an existing checkout. */
export const SOURCE_DIR = process.env.API_DATA_DIR ?? join(process.cwd(), '.cache', 'api-data')

const apiRoot = () => join(SOURCE_DIR, 'data', 'api', 'v2')

/**
 * Make sure the data mirror is present (shallow clone) and, when asked, up to date.
 * Reading a local copy keeps builds fast and puts no load on the PokeAPI servers.
 */
export function ensureSource(update = false): string {
  if (!existsSync(join(SOURCE_DIR, '.git'))) {
    console.log(`Cloning ${REPO_URL} into ${SOURCE_DIR} (one-time, large)...`)
    execFileSync('git', ['clone', '--depth', '1', '--single-branch', '--quiet', REPO_URL, SOURCE_DIR], { stdio: 'inherit' })
  }
  else if (update) {
    console.log('Updating the PokeAPI data mirror...')
    execFileSync('git', ['-C', SOURCE_DIR, 'pull', '--depth', '1', '--quiet'], { stdio: 'inherit' })
  }
  return execFileSync('git', ['-C', SOURCE_DIR, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
}

/** Read `<endpoint>/<id>/index.json`, or any nested path such as `pokemon/25/encounters`. */
export function read<T>(path: string): T {
  return JSON.parse(readFileSync(join(apiRoot(), path, 'index.json'), 'utf8')) as T
}

export function exists(path: string): boolean {
  return existsSync(join(apiRoot(), path, 'index.json'))
}

/** Numeric resource ids of an endpoint, ascending. */
export function ids(endpoint: string): number[] {
  return readdirSync(join(apiRoot(), endpoint))
    .filter(entry => /^\d+$/.test(entry))
    .map(Number)
    .sort((a, b) => a - b)
}

/** Every resource of an endpoint, in id order. */
export function readAll<T>(endpoint: string): T[] {
  return ids(endpoint).map(id => read<T>(`${endpoint}/${id}`))
}

/** Last numeric segment of a PokeAPI url: `/api/v2/pokemon/25/` -> 25. */
export function idFromUrl(url: string): number {
  return Number(url.replace(/\/$/, '').split('/').pop())
}
