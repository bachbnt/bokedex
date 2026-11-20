<script setup lang="ts">
import type { BerryRow } from '#shared/types/encyclopedia'

const { t } = useI18n()
const { name, altName, locale } = useL10n()
const { refs } = useTaxonomyRefs()
const labels = useLabels(refs)
const sprites = useSprites()
const { data, status } = useDataset<BerryRow[]>('berries')

useSeoMeta({ title: () => `${t('berries.title')} | Bokedex`, description: () => t('berries.description') })

const rows = computed(() => (data.value ?? []).toSorted((a, b) => name(a.names).localeCompare(name(b.names), locale.value)))
const value = (number: number | null, unit = '') => (number === null ? '–' : `${number}${unit}`)
</script>

<template>
  <div class="space-y-6">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">{{ t('berries.title') }}</h1>
      <p class="text-lg text-muted">{{ t('berries.lead', { count: rows.length }) }}</p>
    </header>

    <div v-if="status === 'pending' && !data" class="skeleton h-96" />
    <div v-else class="panel overflow-x-auto p-4">
      <table class="w-full min-w-[48rem] text-left text-sm">
        <thead class="text-muted">
          <tr class="border-b border-line">
            <th class="py-2 pr-3 font-medium">{{ t('berries.berry') }}</th>
            <th class="py-2 pr-3 font-medium">{{ t('berries.giftType') }}</th>
            <th class="py-2 pr-3 text-right font-medium">{{ t('berries.giftPower') }}</th>
            <th class="py-2 pr-3 text-right font-medium">{{ t('berries.growthTime') }}</th>
            <th class="py-2 pr-3 text-right font-medium">{{ t('berries.size') }}</th>
            <th class="py-2 pr-3 font-medium">{{ t('berries.firmness') }}</th>
            <th class="py-2 font-medium">{{ t('berries.flavors') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="berry in rows" :key="berry.slug" class="border-b border-line/60 last:border-0">
            <td class="py-2.5 pr-3">
              <NuxtLinkLocale :to="`/items/${berry.slug}`" class="flex items-center gap-3">
                <img :src="sprites.item(berry.slug)" alt="" width="32" height="32" loading="lazy" class="h-8 w-8 shrink-0 [image-rendering:pixelated]">
                <span>
                  <span class="block font-semibold underline decoration-line decoration-2 underline-offset-4">{{ name(berry.names) }}</span>
                  <span v-if="altName(berry.names)" class="block text-xs text-muted">{{ altName(berry.names) }}</span>
                </span>
              </NuxtLinkLocale>
            </td>
            <td class="py-2.5 pr-3"><TypeBadge v-if="berry.naturalGiftType" :type="berry.naturalGiftType" size="sm" /></td>
            <td class="py-2.5 pr-3 text-right tabular-nums">{{ value(berry.naturalGiftPower) }}</td>
            <td class="py-2.5 pr-3 text-right tabular-nums">{{ value(berry.growthTime, ' h') }}</td>
            <td class="py-2.5 pr-3 text-right tabular-nums">{{ value(berry.size, ' mm') }}</td>
            <td class="py-2.5 pr-3">{{ berry.firmness ? labels.taxonomy('berry-firmness', berry.firmness) : '–' }}</td>
            <td class="py-2.5">
              <span v-for="flavor in berry.flavors" :key="flavor.flavor" class="mr-1.5 inline-block rounded-full bg-surface-2 px-2 py-0.5 text-xs">{{ labels.taxonomy('flavor', flavor.flavor) }} {{ flavor.potency }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
