/** Hiragana to katakana, so kana search matches whichever script the visitor types. */
export function toKatakana(value: string): string {
  return value.replace(/[ぁ-ゖ]/g, char => String.fromCharCode(char.charCodeAt(0) + 0x60))
}

/**
 * One comparable form for names and queries: width-normalized, lowercase, katakana, with spaces and
 * punctuation removed. "ピカチュウ", "ぴかちゅう" and "Pikachu" are then all easy to match.
 */
export function normalizeSearch(value: string): string {
  return toKatakana(value.normalize('NFKC').toLowerCase()).replace(/[\s\-'’.・･!?:()（）]/g, '')
}
