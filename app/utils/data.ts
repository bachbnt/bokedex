/**
 * Where a published list lives. In the browser it is a static file; while rendering (prerender or dev)
 * the server reads it through an API route, because it cannot always fetch its own static files.
 */
export function datasetUrl(name: string): string {
  return import.meta.server ? `/api/data/${name}` : `/data/${name}.json`
}
