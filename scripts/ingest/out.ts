import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

/** Server-only data: one JSON per entity, read while pages are prerendered. Never published. */
export const GENERATED_DIR = join(process.cwd(), 'data', 'generated')

/** Published data: lists, indexes and per-Pokémon files the browser loads on demand. */
export const PUBLIC_DIR = join(process.cwd(), 'public', 'data')

export function writeJson(root: string, relativePath: string, data: unknown): void {
  const target = join(root, relativePath)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, JSON.stringify(data))
}

export function resetOutputs(): void {
  rmSync(GENERATED_DIR, { recursive: true, force: true })
  rmSync(PUBLIC_DIR, { recursive: true, force: true })
}
