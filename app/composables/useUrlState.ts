import type { LocationQuery } from 'vue-router'

type Primitive = string | number | boolean

/** `false` as a default means "a boolean", not "always false". */
type Widen<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T
type State<T> = { [K in keyof T]: Widen<T[K]> }

/**
 * Filter state for a list page, kept in the URL so a view can be shared.
 * Values equal to their default are left out of the URL. The URL is read through a watcher because a
 * prerendered page hydrates with its query stripped; our own URL updates are recognised and ignored when
 * they echo back, so quick typing is never overwritten.
 */
export function useUrlState<T extends Record<string, Primitive>>(defaults: T): State<T> {
  const route = useRoute()
  const router = useRouter()
  const keys = Object.keys(defaults) as (keyof T & string)[]
  const state = reactive({ ...defaults }) as State<T>

  function parse(query: LocationQuery): State<T> {
    const result = { ...defaults } as State<T>
    for (const key of keys) {
      const raw = query[key]
      if (typeof raw !== 'string') continue
      const fallback = defaults[key]
      result[key] = (typeof fallback === 'number' ? (Number(raw) || fallback) : typeof fallback === 'boolean' ? raw === '1' : raw) as State<T>[typeof key]
    }
    return result
  }

  const serialize = (value: State<T>) =>
    Object.fromEntries(keys.filter(key => value[key] !== defaults[key]).map(key => [key, typeof value[key] === 'boolean' ? '1' : String(value[key])]))

  let lastWritten = ''

  watch(() => route.query, (query) => {
    const incoming = parse(query)
    if (JSON.stringify(serialize(incoming)) === lastWritten) {
      lastWritten = ''
      return
    }
    Object.assign(state, incoming)
  }, { immediate: true })

  watchDebounced(() => ({ ...state }), () => {
    const query = serialize(state)
    lastWritten = JSON.stringify(query)
    router.replace({ query })
  }, { debounce: 250, deep: true })

  return state
}
