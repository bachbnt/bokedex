<script setup lang="ts">
const { t } = useI18n()
const { name, locale } = useL10n()
const { reference, status } = useReference()
const { refs } = useTaxonomyRefs()
const labels = useLabels(refs)
const route = useRoute()

useSeoMeta({ title: () => `${t('natures.title')} | Bokedex`, description: () => t('natures.description') })

const natures = computed(() => (reference.value?.natures ?? []).toSorted((a, b) => name(a.names).localeCompare(name(b.names), locale.value)))
// A nature picked from search arrives as ?nature=<slug>; highlight it and bring it into view.
const highlighted = computed(() => String(route.query.nature ?? ''))
watch(highlighted, async (slug) => {
  if (!slug || !import.meta.client) return
  await nextTick()
  document.getElementById(slug)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
}, { immediate: true, flush: 'post' })
</script>

<template>
  <div class="space-y-6">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">{{ t('natures.title') }}</h1>
      <p class="text-lg text-muted">{{ t('natures.lead') }}</p>
    </header>

    <div v-if="status === 'pending' && !reference" class="skeleton h-96" />
    <div v-else class="panel overflow-x-auto p-4">
      <table class="w-full min-w-[32rem] text-left text-sm">
        <thead class="text-muted">
          <tr class="border-b border-line">
            <th class="py-2 pr-3 font-medium">{{ t('natures.nature') }}</th>
            <th class="py-2 pr-3 font-medium">{{ t('natures.increases') }}</th>
            <th class="py-2 pr-3 font-medium">{{ t('natures.decreases') }}</th>
            <th class="py-2 pr-3 font-medium">{{ t('natures.likes') }}</th>
            <th class="py-2 font-medium">{{ t('natures.dislikes') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="nature in natures" :id="nature.slug" :key="nature.slug" class="border-b border-line/60 last:border-0" :class="highlighted === nature.slug ? 'bg-glow/20' : ''">
            <th scope="row" class="py-2.5 pr-3 text-left font-semibold">
              {{ name(nature.names) }}
              <span v-if="nature.names.ja && locale === 'en'" class="ml-1 text-xs font-normal text-muted">{{ nature.names.ja }}</span>
              <span v-else-if="locale === 'ja'" class="ml-1 text-xs font-normal text-muted">{{ nature.names.en }}</span>
            </th>
            <template v-if="nature.increasedStat">
              <td class="py-2.5 pr-3 font-medium text-good">+ {{ labels.taxonomy('stat', nature.increasedStat) }}</td>
              <td class="py-2.5 pr-3 font-medium text-bad">− {{ labels.taxonomy('stat', nature.decreasedStat) }}</td>
              <td class="py-2.5 pr-3">{{ labels.taxonomy('flavor', nature.likesFlavor) }}</td>
              <td class="py-2.5">{{ labels.taxonomy('flavor', nature.hatesFlavor) }}</td>
            </template>
            <td v-else colspan="4" class="py-2.5 text-muted">{{ t('natures.neutral') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
