import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

type Messages = { [key: string]: string | Messages }

const root = process.cwd()
const load = (locale: string) => JSON.parse(readFileSync(join(root, 'i18n/locales', `${locale}.json`), 'utf8')) as Messages

function flatten(messages: Messages, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) => (typeof value === 'string' ? [`${prefix}${key}`] : flatten(value, `${prefix}${key}.`)))
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.(vue|ts)$/.test(entry) ? [path] : []
  })
}

describe('translations', () => {
  const en = flatten(load('en'))
  const ja = flatten(load('ja'))

  it('has exactly the same keys in English and Japanese', () => {
    expect(en.filter(key => !ja.includes(key))).toEqual([])
    expect(ja.filter(key => !en.includes(key))).toEqual([])
  })

  it('has a Japanese string that is not just a copy of the English one for every sentence', () => {
    const english = load('en')
    const japanese = load('ja')
    const lookup = (messages: Messages, key: string) => key.split('.').reduce<string | Messages | undefined>((node, part) => (typeof node === 'object' ? node[part] : undefined), messages) as string
    const untranslated = en.filter(key => lookup(english, key).length > 40 && lookup(english, key) === lookup(japanese, key))
    expect(untranslated).toEqual([])
  })

  it('defines every key the app asks for', () => {
    const known = new Set(en)
    const used = new Set<string>()
    const dynamicPrefixes = new Set<string>()
    for (const file of sourceFiles(join(root, 'app'))) {
      const source = readFileSync(file, 'utf8')
      for (const match of source.matchAll(/\bt\(\s*'([^']+)'/g)) used.add(match[1]!)
      for (const match of source.matchAll(/\bt\(\s*`([^`$]+)\$\{/g)) dynamicPrefixes.add(match[1]!)
      for (const match of source.matchAll(/label: '((?:nav|search)\.[^']+)'/g)) used.add(match[1]!)
    }

    expect([...used].filter(key => !known.has(key))).toEqual([])
    for (const prefix of dynamicPrefixes) expect(en.some(key => key.startsWith(prefix)), `no keys under "${prefix}"`).toBe(true)
  })
})
