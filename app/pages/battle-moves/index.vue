<script setup lang="ts">
import type { MoveRow } from '#shared/types/encyclopedia'

const { t } = useI18n()
const { name, altName } = useL10n()
const labels = useLabels()
const { data: moves, status } = useDataset<MoveRow[]>('moves')

useSeoMeta({ title: () => `${t('battle.title')} | Bokedex`, description: () => t('battle.description') })

const bySlug = computed(() => new Map((moves.value ?? []).map(move => [move.slug, move])))

/** One row per type: its Z-Move (a physical and a special form share a name) and its Max Move. */
const rows = computed(() => Object.keys(Z_MOVE_BY_TYPE).map(type => ({
  type,
  z: bySlug.value.get(`${Z_MOVE_BY_TYPE[type]}--physical`),
  max: bySlug.value.get(MAX_MOVE_BY_TYPE[type] ?? ''),
})))
</script>

<template>
  <div class="space-y-6">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">{{ t('battle.title') }}</h1>
      <p class="text-lg text-muted">{{ t('battle.lead') }}</p>
    </header>

    <section class="panel overflow-x-auto p-6" aria-labelledby="by-type">
      <h2 id="by-type" class="mb-4 text-2xl font-bold">{{ t('battle.byType') }}</h2>
      <div v-if="status === 'pending'" class="skeleton h-96" />
      <table v-else class="w-full min-w-[34rem] text-left text-sm">
        <thead class="text-muted">
          <tr>
            <th scope="col" class="py-2 pr-3 font-medium">{{ t('moves.type') }}</th>
            <th scope="col" class="py-2 pr-3 font-medium">{{ t('battle.zMove') }}</th>
            <th scope="col" class="py-2 font-medium">{{ t('battle.maxMove') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.type" class="border-t border-line align-top">
            <td class="py-2.5 pr-3"><TypeBadge :type="row.type" size="sm" link /></td>
            <td class="py-2.5 pr-3">
              <template v-if="row.z">
                <NuxtLinkLocale :to="`/moves/${row.z.slug}`" class="font-semibold underline decoration-line decoration-2 underline-offset-4">{{ name(row.z.names) }}</NuxtLinkLocale>
                <span v-if="altName(row.z.names)" class="block text-xs text-muted">{{ altName(row.z.names) }}</span>
              </template>
            </td>
            <td class="py-2.5">
              <template v-if="row.max">
                <NuxtLinkLocale :to="`/moves/${row.max.slug}`" class="font-semibold underline decoration-line decoration-2 underline-offset-4">{{ name(row.max.names) }}</NuxtLinkLocale>
                <span v-if="altName(row.max.names)" class="block text-xs text-muted">{{ altName(row.max.names) }}</span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="mt-4 text-sm text-muted">{{ t('battle.signature') }}</p>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="panel p-6" aria-labelledby="z-power">
        <h2 id="z-power" class="text-2xl font-bold">{{ t('battle.zPower') }}</h2>
        <p class="mb-4 mt-1 text-sm text-muted">{{ t('battle.zPowerHint') }}</p>
        <table class="w-full text-left text-sm">
          <thead class="text-muted">
            <tr>
              <th scope="col" class="py-2 pr-3 font-medium">{{ t('battle.basePower') }}</th>
              <th scope="col" class="py-2 text-right font-medium">{{ t('battle.zMove') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="band in Z_BANDS" :key="band.label" class="border-t border-line">
              <td class="py-2 pr-3 tabular-nums">{{ band.label }}</td>
              <td class="py-2 text-right font-semibold tabular-nums">{{ band.power }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="panel p-6" aria-labelledby="max-power">
        <h2 id="max-power" class="text-2xl font-bold">{{ t('battle.maxPower') }}</h2>
        <p class="mb-4 mt-1 text-sm text-muted">{{ t('battle.maxPowerHint', { fighting: labels.type('fighting'), poison: labels.type('poison') }) }}</p>
        <table class="w-full text-left text-sm">
          <thead class="text-muted">
            <tr>
              <th scope="col" class="py-2 pr-3 font-medium">{{ t('battle.basePower') }}</th>
              <th scope="col" class="py-2 pr-3 text-right font-medium">{{ t('battle.maxMove') }}</th>
              <th scope="col" class="py-2 text-right font-medium">{{ labels.type('fighting') }} / {{ labels.type('poison') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="band in MAX_BANDS" :key="band.label" class="border-t border-line">
              <td class="py-2 pr-3 tabular-nums">{{ band.label }}</td>
              <td class="py-2 pr-3 text-right font-semibold tabular-nums">{{ band.power }}</td>
              <td class="py-2 text-right font-semibold tabular-nums">{{ band.powerLow }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <p class="max-w-3xl text-sm text-muted">{{ t('battle.note') }}</p>
  </div>
</template>
