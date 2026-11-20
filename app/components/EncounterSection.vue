<script setup lang="ts">
import type { Encounter, LocationRow, ReferenceData, Taxonomy } from '#shared/types/encyclopedia'

const props = defineProps<{ pokemonId: number }>()

const { t } = useI18n()
const { name } = useL10n()

const { data: encounters, status, error } = useLazyFetch<Encounter[]>(() => `/data/encounters/${props.pokemonId}.json`, {
  server: false,
  key: `encounters:${props.pokemonId}`,
})
const { data: locations } = useDataset<LocationRow[]>('locations', { clientOnly: true })
const { data: taxonomy } = useDataset<Taxonomy>('taxonomy', { clientOnly: true })
const { data: reference } = useDataset<ReferenceData>('reference', { clientOnly: true })

const label = (kind: keyof Taxonomy, slug: string) => {
  const names = taxonomy.value?.[kind]?.[slug]
  return names ? name(names) : titleCase(slug)
}
const locationName = (slug: string) => {
  const row = locations.value?.find(entry => entry.slug === slug)
  return row ? name(row.names) : titleCase(slug)
}

/** Games in release order, only those this Pokémon can be found in. */
const versions = computed(() => {
  const order = new Map((reference.value?.versions ?? []).map((version, index) => [version.slug, index]))
  const found = new Set((encounters.value ?? []).flatMap(encounter => encounter.versions))
  return [...found].sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0))
})

const version = ref('')
watch(versions, (list) => { if (!list.includes(version.value)) version.value = list[0] ?? '' }, { immediate: true })

const rows = computed(() =>
  (encounters.value ?? [])
    .filter(encounter => encounter.versions.includes(version.value))
    .toSorted((a, b) => locationName(a.location).localeCompare(locationName(b.location)) || b.chance - a.chance),
)

const levels = (encounter: Encounter) => (encounter.minLevel === encounter.maxLevel ? `Lv. ${encounter.minLevel}` : `Lv. ${encounter.minLevel}–${encounter.maxLevel}`)
</script>

<template>
  <div>
    <div v-if="status === 'pending' || status === 'idle'" class="space-y-2">
      <div v-for="n in 4" :key="n" class="skeleton h-10 !rounded-xl" />
    </div>
    <p v-else-if="error || !encounters?.length" class="text-muted">{{ t('encounters.none') }}</p>

    <template v-else>
      <label class="mb-4 flex items-center gap-2 text-sm">
        <span class="text-muted">{{ t('moves.game') }}</span>
        <select v-model="version" class="input !w-auto cursor-pointer">
          <option v-for="option in versions" :key="option" :value="option">{{ label('version', option) }}</option>
        </select>
      </label>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[32rem] text-left text-sm">
          <thead class="text-muted">
            <tr class="border-b border-line">
              <th class="py-2 pr-3 font-medium">{{ t('encounters.location') }}</th>
              <th class="py-2 pr-3 font-medium">{{ t('encounters.method') }}</th>
              <th class="py-2 pr-3 font-medium">{{ t('encounters.levels') }}</th>
              <th class="py-2 text-right font-medium">{{ t('encounters.chance') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(encounter, index) in rows" :key="index" class="border-b border-line/60 align-top last:border-0">
              <td class="py-2.5 pr-3">
                <NuxtLinkLocale :to="`/locations/${encounter.location}`" class="font-semibold underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">
                  {{ locationName(encounter.location) }}
                </NuxtLinkLocale>
                <span v-if="encounter.conditions.length" class="block text-xs text-muted">
                  {{ encounter.conditions.map(condition => label('encounter-condition', condition)).join(t('common.listSeparator')) }}
                </span>
              </td>
              <td class="py-2.5 pr-3">{{ label('encounter-method', encounter.method) }}</td>
              <td class="py-2.5 pr-3 tabular-nums">{{ levels(encounter) }}</td>
              <td class="py-2.5 text-right tabular-nums">{{ encounter.chance }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
