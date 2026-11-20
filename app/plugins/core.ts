/** Make the type names available before anything renders, on the server and (if ever missing) the client. */
export default defineNuxtPlugin(async () => {
  const core = useCoreData()
  if (!core.value) core.value = await loadCoreData()
})
