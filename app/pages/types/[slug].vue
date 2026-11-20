<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const labels = useLabels()
const { name, altName } = useL10n()
const refs = useRefs()
const core = useCoreData()
const { entity: type } = await useEntity('types', () => String(route.params.slug))

useSeoMeta({ title: () => `${labels.type(type.value.slug)} | Bokedex`, description: () => t('types.detailDescription', { name: labels.type(type.value.slug) }) })

const offence = computed(() => [
  { label: t('types.offence.double'), tone: 'text-good', value: 2, list: type.value.relations.doubleTo },
  { label: t('types.offence.half'), tone: 'text-bad', value: 0.5, list: type.value.relations.halfTo },
  { label: t('types.offence.none'), tone: 'text-muted', value: 0, list: type.value.relations.noTo },
].filter(group => group.list.length))
const defence = computed(() => [
  { label: t('types.defence.double'), tone: 'text-bad', value: 2, list: type.value.relations.doubleFrom },
  { label: t('types.defence.half'), tone: 'text-good', value: 0.5, list: type.value.relations.halfFrom },
  { label: t('types.defence.none'), tone: 'text-muted', value: 0, list: type.value.relations.noFrom },
].filter(group => group.list.length))

const moves = computed(() => type.value.moves.flatMap(slug => (refs.value.moves[slug] ? [refs.value.moves[slug]] : []))
  .toSorted((a, b) => (b.power ?? -1) - (a.power ?? -1) || a.id - b.id))
</script>

<template>
  <article class="space-y-6" :style="pokemonTheme([type.slug])">
    <NuxtLinkLocale to="/types" class="btn btn-ghost w-fit !px-4">
      <AppIcon name="arrow-left" :size="18" />
      {{ t('types.title') }}
    </NuxtLinkLocale>

    <EntityHeader :names="core?.types[type.slug] ?? type.names" :kicker="t('types.kicker')">
      <TypeBadge :type="type.slug" />
    </EntityHeader>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="panel space-y-4 p-6">
        <h2 class="text-2xl font-bold">{{ t('types.offence.title', { type: labels.type(type.slug) }) }}</h2>
        <div v-for="group in offence" :key="group.label">
          <h3 class="mb-2 text-sm font-semibold" :class="group.tone">{{ group.label }}</h3>
          <div class="flex flex-wrap gap-2"><TypeBadge v-for="other in group.list" :key="other" :type="other" size="sm" :multiplier="group.value" link /></div>
        </div>
      </section>
      <section class="panel space-y-4 p-6">
        <h2 class="text-2xl font-bold">{{ t('types.defence.title', { type: labels.type(type.slug) }) }}</h2>
        <div v-for="group in defence" :key="group.label">
          <h3 class="mb-2 text-sm font-semibold" :class="group.tone">{{ group.label }}</h3>
          <div class="flex flex-wrap gap-2"><TypeBadge v-for="other in group.list" :key="other" :type="other" size="sm" :multiplier="group.value" link /></div>
        </div>
      </section>
    </div>

    <section class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('types.pokemonOfType', { count: type.pokemon.length }) }}</h2>
      <PokemonGrid :ids="type.pokemon" />
    </section>

    <section class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('types.movesOfType', { count: moves.length }) }}</h2>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[30rem] text-left text-sm">
          <thead class="text-muted">
            <tr class="border-b border-line">
              <th class="py-2 pr-3 font-medium">{{ t('moves.move') }}</th>
              <th class="py-2 pr-3 font-medium">{{ t('moves.class') }}</th>
              <th class="py-2 pr-3 text-right font-medium">{{ t('moves.power') }}</th>
              <th class="py-2 pr-3 text-right font-medium">{{ t('moves.accuracy') }}</th>
              <th class="py-2 text-right font-medium">PP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="move in moves" :key="move.slug" class="border-b border-line/60 last:border-0">
              <td class="py-2.5 pr-3">
                <NuxtLinkLocale :to="`/moves/${move.slug}`" class="font-semibold underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">{{ name(move.names) }}</NuxtLinkLocale>
                <span v-if="altName(move.names)" class="ml-2 text-xs text-muted">{{ altName(move.names) }}</span>
              </td>
              <td class="py-2.5 pr-3"><DamageClass :slug="move.damageClass" :label="labels.taxonomy('damage-class', move.damageClass)" /></td>
              <td class="py-2.5 pr-3 text-right tabular-nums">{{ move.power ?? '–' }}</td>
              <td class="py-2.5 pr-3 text-right tabular-nums">{{ move.accuracy ?? '–' }}</td>
              <td class="py-2.5 text-right tabular-nums">{{ move.pp ?? '–' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </article>
</template>
