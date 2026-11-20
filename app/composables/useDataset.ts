/**
 * A published list (dex, moves, items...) loaded straight from its static file.
 * List pages need the whole table, so they load it normally (and prerender it into their payload).
 * `clientOnly` is for sections that load on demand: it skips the server so the table never gets baked
 * into thousands of prerendered pages.
 */
export function useDataset<T>(name: string, options: { clientOnly?: boolean } = {}) {
  return useFetch<T>(datasetUrl(name), {
    key: `data:${name}`,
    server: !options.clientOnly,
    lazy: options.clientOnly,
  })
}
