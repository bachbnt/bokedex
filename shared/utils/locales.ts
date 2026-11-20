import type { Locale, Names, Text } from '#shared/types/encyclopedia'

export const LOCALES: readonly Locale[] = ['en', 'ja']
export const DEFAULT_LOCALE: Locale = 'en'

export const isLocale = (value: unknown): value is Locale => LOCALES.includes(value as Locale)

/** A localized name for display, always defined (falls back to English). */
export function pickName(names: Names | null | undefined, locale: Locale): string {
  if (!names) return ''
  return (locale === 'ja' ? names.ja : names.en) ?? names.en
}

/** The secondary-language name shown beside the primary one (Japanese on English pages and vice versa). */
export function pickAltName(names: Names | null | undefined, locale: Locale): string | undefined {
  if (!names) return undefined
  const alt = locale === 'ja' ? names.en : names.ja
  return alt && alt !== pickName(names, locale) ? alt : undefined
}

export interface PickedText {
  value: string
  /** The language the text is actually in; differs from the requested one when we fell back. */
  language: Locale
}

/** Descriptive text for display, or undefined when neither language has any. */
export function pickText(text: Text | null | undefined, locale: Locale): PickedText | undefined {
  if (!text) return undefined
  const wanted = text[locale]
  if (wanted) return { value: wanted, language: locale }
  if (text.en) return { value: text.en, language: 'en' }
  return undefined
}
