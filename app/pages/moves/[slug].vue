<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { name, locale } = useL10n()
const { entity: move, refs } = await useEntity('moves', () => String(route.params.slug))
const labels = useLabels(refs)

useSeoMeta({
  title: () => `${name(move.value.names)} | Bokedex`,
  description: () => move.value.effect[locale.value] ?? move.value.effect.en ?? t('moves.seoFallback', { name: name(move.value.names) }),
})

const facts = computed(() => {
  const value = move.value
  return [
    { label: t('moves.power'), value: value.power ?? '–' },
    { label: t('moves.accuracy'), value: value.accuracy === null ? '–' : `${value.accuracy}%` },
    { label: 'PP', value: value.pp ?? '–' },
    { label: t('moves.priority'), value: value.priority > 0 ? `+${value.priority}` : value.priority },
    { label: t('moves.target'), value: labels.taxonomy('move-target', value.target) },
    { label: t('moves.generation'), value: t('pokemon.generationN', { n: value.generation }) },
  ]
})

/** Side effects in plain words, only the ones that apply. */
const meta = computed(() => {
  const m = move.value.meta
  if (!m) return []
  const rows: { label: string, value: string }[] = []
  if (m.ailment) rows.push({ label: t('moves.meta.ailment'), value: `${labels.taxonomy('move-ailment', m.ailment)}${m.ailmentChance ? ` (${m.ailmentChance}%)` : ''}` })
  if (m.category) rows.push({ label: t('moves.meta.category'), value: labels.taxonomy('move-category', m.category) })
  if (m.critRate) rows.push({ label: t('moves.meta.crit'), value: `+${m.critRate}` })
  if (m.flinchChance) rows.push({ label: t('moves.meta.flinch'), value: `${m.flinchChance}%` })
  if (m.drain) rows.push({ label: m.drain > 0 ? t('moves.meta.drain') : t('moves.meta.recoil'), value: `${Math.abs(m.drain)}%` })
  if (m.healing) rows.push({ label: t('moves.meta.healing'), value: `${m.healing}%` })
  if (m.minHits) rows.push({ label: t('moves.meta.hits'), value: m.maxHits && m.maxHits !== m.minHits ? `${m.minHits}–${m.maxHits}` : String(m.minHits) })
  if (m.minTurns) rows.push({ label: t('moves.meta.turns'), value: m.maxTurns && m.maxTurns !== m.minTurns ? `${m.minTurns}–${m.maxTurns}` : String(m.minTurns) })
  for (const change of move.value.statChanges) {
    rows.push({ label: labels.taxonomy('stat', change.stat), value: `${change.change > 0 ? '+' : ''}${change.change}${m.statChance ? ` (${m.statChance}%)` : ''}` })
  }
  return rows
})
</script>

<template>
  <article class="space-y-6">
    <NuxtLinkLocale to="/moves" class="btn btn-ghost w-fit !px-4">
      <AppIcon name="arrow-left" :size="18" />
      {{ t('moves.listTitle') }}
    </NuxtLinkLocale>

    <EntityHeader :names="move.names" :kicker="t('moves.kicker')">
      <TypeBadge :type="move.type" link />
      <DamageClass :slug="move.damageClass" :label="labels.taxonomy('damage-class', move.damageClass)" />
      <p class="basis-full pt-2 text-lg"><LocalizedText :value="move.effect" /></p>
    </EntityHeader>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="panel p-6">
        <h2 class="mb-4 text-2xl font-bold">{{ t('moves.sections.data') }}</h2>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <div v-for="fact in facts" :key="fact.label">
            <dt class="text-sm text-muted">{{ fact.label }}</dt>
            <dd class="font-semibold">{{ fact.value }}</dd>
          </div>
        </dl>
      </section>

      <section v-if="meta.length" class="panel p-6">
        <h2 class="mb-4 text-2xl font-bold">{{ t('moves.sections.effects') }}</h2>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <div v-for="row in meta" :key="row.label">
            <dt class="text-sm text-muted">{{ row.label }}</dt>
            <dd class="font-semibold">{{ row.value }}</dd>
          </div>
        </dl>
      </section>
    </div>

    <section v-if="move.machines.length" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('moves.sections.machines') }}</h2>
      <ul class="flex flex-wrap gap-2">
        <li v-for="machine in move.machines" :key="`${machine.versionGroup}-${machine.item}`" class="chip !cursor-default">
          <NuxtLinkLocale :to="`/items/${machine.item}`" class="font-display font-bold uppercase">{{ labels.item(machine.item) }}</NuxtLinkLocale>
          <span class="text-muted">{{ labels.taxonomy('version-group', machine.versionGroup) }}</span>
        </li>
      </ul>
    </section>

    <section class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('moves.sections.learnedBy', { count: move.learnedBy.length }) }}</h2>
      <PokemonGrid v-if="move.learnedBy.length" :ids="move.learnedBy" />
      <p v-else class="text-muted">{{ t('moves.noLearners') }}</p>
    </section>

    <section v-if="move.flavor.length" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('moves.sections.descriptions') }}</h2>
      <VersionTexts :entries="move.flavor" />
    </section>
  </article>
</template>
