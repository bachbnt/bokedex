import type { Names, Text } from '#shared/types/encyclopedia'
import { titleCase } from '#shared/utils/format'
import type { LangEffect, LangName, LangText } from '#ingest/raw'

const JA = 'ja'
const JA_KANA = new Set(['ja-hrkt', 'ja-Hrkt'])
const JA_ROMA = new Set(['ja-roma', 'roomaji'])

/** Japanese flavor text lays words out with newlines and ideographic spaces; flatten them for the web. */
function cleanText(value: string, language: 'en' | 'ja'): string {
  const flat = value.replace(/[\f\n\r]+/g, language === 'ja' ? '' : ' ').replace(/­/g, '')
  return (language === 'ja' ? flat.replace(/　/g, ' ') : flat).replace(/\s+/g, ' ').trim()
}

/** Localized names with English fallback built from the slug when upstream has none. */
export function names(entries: LangName[] | undefined, slug: string): Names {
  let en: string | undefined
  let ja: string | undefined
  let jaKana: string | undefined
  let jaRoma: string | undefined
  for (const entry of entries ?? []) {
    const language = entry.language.name
    if (language === 'en') en = entry.name
    else if (language === JA) ja = entry.name
    else if (JA_KANA.has(language)) jaKana = entry.name
    else if (JA_ROMA.has(language)) jaRoma = entry.name
  }

  const result: Names = { en: en ?? titleCase(slug) }
  const japanese = ja ?? jaKana
  if (japanese) result.ja = japanese
  if (jaKana) result.jaKana = jaKana
  if (jaRoma) result.jaRoma = jaRoma
  return result
}

/** One language's text from a list of localized entries; the last entry wins (newest wording). */
function pickLanguage<T extends { language: { name: string } }>(entries: T[], accept: (language: string) => boolean): T | undefined {
  return entries.findLast(entry => accept(entry.language.name))
}

export function textOf(entries: LangText[] | undefined): Text {
  return textFrom(entries ?? [], entry => entry.flavor_text ?? entry.text)
}

export function effectOf(entries: LangEffect[] | undefined, field: 'effect' | 'short_effect'): Text {
  return textFrom(entries ?? [], entry => entry[field])
}

function textFrom<T extends { language: { name: string } }>(entries: T[], read: (entry: T) => string | undefined): Text {
  const en = pickLanguage(entries, language => language === 'en')
  const ja = pickLanguage(entries, language => language === JA) ?? pickLanguage(entries, language => JA_KANA.has(language))
  const result: Text = {}
  const enText = en && read(en)
  const jaText = ja && read(ja)
  if (enText) result.en = cleanText(enText, 'en')
  if (jaText) result.ja = cleanText(jaText, 'ja')
  return result
}

/**
 * Flavor text grouped by a key (version or version group): one entry per key holding both languages.
 * Keys appear in the order upstream lists them, which is chronological.
 */
export function flavorBy<K extends 'version' | 'version_group'>(entries: LangText[] | undefined, key: K): { key: string, text: Text }[] {
  const groups = new Map<string, LangText[]>()
  for (const entry of entries ?? []) {
    const name = entry[key]?.name
    if (!name) continue
    const bucket = groups.get(name) ?? []
    bucket.push(entry)
    groups.set(name, bucket)
  }
  return [...groups].map(([name, bucket]) => ({ key: name, text: textOf(bucket) })).filter(entry => entry.text.en || entry.text.ja)
}
