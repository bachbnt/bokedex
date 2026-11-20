<script setup lang="ts">
import type { Learnset, MoveRow, Taxonomy } from '#shared/types/encyclopedia'

const props = defineProps<{ pokemonId: number }>()

const { t } = useI18n()
const { name, altName } = useL10n()

const { data: learnset, status, error, refresh } = useLazyFetch<Learnset>(() => `/data/learnsets/${props.pokemonId}.json`, {
  server: false,
  key: `learnset:${props.pokemonId}`,
})
const { data: moves } = useDataset<MoveRow[]>('moves', { clientOnly: true })
const { data: taxonomy } = useDataset<Taxonomy>('taxonomy', { clientOnly: true })

const moveBySlug = computed(() => new Map((moves.value ?? []).map(row => [row.slug, row])))
const label = (kind: keyof Taxonomy, slug: string) => {
  const names = taxonomy.value?.[kind]?.[slug]
  return names ? name(names) : titleCase(slug)
}

const versionGroup = ref(0)
const method = ref('level-up')

// Default to the newest game the Pokémon appears in.
watch(learnset, (value) => { if (value) versionGroup.value = Math.max(value.versionGroups.length - 1, 0) }, { immediate: true })

interface Row { move: string, level: number }

/** Every move this Pokémon gets in the chosen game, bucketed by how it is learned. */
const byMethod = computed(() => {
  const buckets = new Map<string, Row[]>()
  const data = learnset.value
  if (!data) return buckets
  for (const entry of data.moves) {
    for (const [groupIndex, methodIndex, level] of entry.learns) {
      if (groupIndex !== versionGroup.value) continue
      const key = data.methods[methodIndex] ?? 'other'
      const rows = buckets.get(key) ?? []
      rows.push({ move: entry.move, level })
      buckets.set(key, rows)
    }
  }
  for (const rows of buckets.values()) rows.sort((a, b) => a.level - b.level || a.move.localeCompare(b.move))
  return buckets
})

const methods = computed(() => [...byMethod.value.keys()].sort((a, b) => (a === 'level-up' ? -1 : b === 'level-up' ? 1 : a.localeCompare(b))))
watch(methods, (list) => { if (!list.includes(method.value)) method.value = list[0] ?? 'level-up' }, { immediate: true })
const rows = computed(() => byMethod.value.get(method.value) ?? [])
</script>

<template>
  <div>
    <div v-if="status === 'pending' || status === 'idle'" class="space-y-2">
      <div v-for="n in 6" :key="n" class="skeleton h-10 !rounded-xl" />
    </div>

    <EmptyState v-else-if="error" icon="refresh" :title="t('moves.errorTitle')" :message="t('moves.errorMessage')" :action="t('common.retry')" @action="refresh()" />

    <template v-else-if="learnset">
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <label class="flex items-center gap-2 text-sm">
          <span class="text-muted">{{ t('moves.game') }}</span>
          <select v-model.number="versionGroup" class="input !w-auto cursor-pointer">
            <option v-for="(group, index) in learnset.versionGroups" :key="group" :value="index">{{ label('version-group', group) }}</option>
          </select>
        </label>
        <div class="flex flex-wrap gap-2" role="group" :aria-label="t('moves.method')">
          <button v-for="option in methods" :key="option" type="button" class="chip" :aria-pressed="method === option" @click="method = option">
            {{ label('learn-method', option) }}
            <span class="text-xs opacity-70">{{ byMethod.get(option)?.length }}</span>
          </button>
        </div>
      </div>

      <p v-if="!rows.length" class="text-muted">{{ t('moves.none') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[34rem] text-left text-sm">
          <thead class="text-muted">
            <tr class="border-b border-line">
              <th v-if="method === 'level-up'" class="py-2 pr-3 font-medium">{{ t('moves.level') }}</th>
              <th class="py-2 pr-3 font-medium">{{ t('moves.move') }}</th>
              <th class="py-2 pr-3 font-medium">{{ t('moves.type') }}</th>
              <th class="py-2 pr-3 font-medium">{{ t('moves.class') }}</th>
              <th class="py-2 pr-3 text-right font-medium">{{ t('moves.power') }}</th>
              <th class="py-2 pr-3 text-right font-medium">{{ t('moves.accuracy') }}</th>
              <th class="py-2 text-right font-medium">PP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="`${row.move}-${row.level}`" class="border-b border-line/60 last:border-0">
              <td v-if="method === 'level-up'" class="font-display py-2.5 pr-3 font-bold tabular-nums">{{ row.level || '–' }}</td>
              <td class="py-2.5 pr-3">
                <NuxtLinkLocale :to="`/moves/${row.move}`" class="font-semibold underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">
                  {{ moveBySlug.get(row.move) ? name(moveBySlug.get(row.move)!.names) : titleCase(row.move) }}
                </NuxtLinkLocale>
                <span v-if="moveBySlug.get(row.move) && altName(moveBySlug.get(row.move)!.names)" class="ml-2 text-xs text-muted">{{ altName(moveBySlug.get(row.move)!.names) }}</span>
              </td>
              <td class="py-2.5 pr-3"><TypeBadge v-if="moveBySlug.get(row.move)" :type="moveBySlug.get(row.move)!.type" size="sm" /></td>
              <td class="py-2.5 pr-3"><DamageClass v-if="moveBySlug.get(row.move)" :slug="moveBySlug.get(row.move)!.damageClass" :label="label('damage-class', moveBySlug.get(row.move)!.damageClass)" /></td>
              <td class="py-2.5 pr-3 text-right tabular-nums">{{ moveBySlug.get(row.move)?.power ?? '–' }}</td>
              <td class="py-2.5 pr-3 text-right tabular-nums">{{ moveBySlug.get(row.move)?.accuracy ?? '–' }}</td>
              <td class="py-2.5 text-right tabular-nums">{{ moveBySlug.get(row.move)?.pp ?? '–' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
