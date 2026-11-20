<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { name } = useL10n()
const { entity: game, refs } = await useEntity('games', () => String(route.params.slug))
const labels = useLabels(refs)

useSeoMeta({ title: () => `${name(game.value.names)} | Bokedex`, description: () => t('games.seoFallback', { name: name(game.value.names) }) })

const machines = computed(() => game.value.machines.map(machine => ({ ...machine, row: refs.value.moves[machine.move] })))
</script>

<template>
  <article class="space-y-6">
    <NuxtLinkLocale to="/games" class="btn btn-ghost w-fit !px-4">
      <AppIcon name="arrow-left" :size="18" />
      {{ t('games.title') }}
    </NuxtLinkLocale>
    <EntityHeader :names="game.names" :kicker="t('games.kicker')">
      <NuxtLinkLocale :to="`/generations/${game.generation}`" class="chip">{{ t('pokemon.generationN', { n: game.generation }) }}</NuxtLinkLocale>
      <NuxtLinkLocale v-for="region in game.regions" :key="region" :to="`/regions/${region}`" class="chip">{{ labels.taxonomy('region', region) }}</NuxtLinkLocale>
    </EntityHeader>

    <section class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('games.versions') }}</h2>
      <ul class="flex flex-wrap gap-2"><li v-for="version in game.versions" :key="version" class="chip !cursor-default">{{ labels.taxonomy('version', version) }}</li></ul>
    </section>

    <section v-if="game.pokedexes.length" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('regions.pokedexes') }}</h2>
      <ul class="flex flex-wrap gap-2">
        <li v-for="pokedex in game.pokedexes" :key="pokedex"><NuxtLinkLocale :to="`/pokedex/${pokedex}`" class="chip">{{ labels.taxonomy('pokedex', pokedex) }}</NuxtLinkLocale></li>
      </ul>
    </section>

    <section v-if="machines.length" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('games.machines', { count: machines.length }) }}</h2>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[30rem] text-left text-sm">
          <thead class="text-muted">
            <tr class="border-b border-line">
              <th class="py-2 pr-3 font-medium">{{ t('games.machine') }}</th>
              <th class="py-2 pr-3 font-medium">{{ t('moves.move') }}</th>
              <th class="py-2 pr-3 font-medium">{{ t('moves.type') }}</th>
              <th class="py-2 pr-3 text-right font-medium">{{ t('moves.power') }}</th>
              <th class="py-2 text-right font-medium">{{ t('moves.accuracy') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="machine in machines" :key="machine.item" class="border-b border-line/60 last:border-0">
              <td class="py-2.5 pr-3"><NuxtLinkLocale :to="`/items/${machine.item}`" class="font-display font-bold underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">{{ labels.item(machine.item) }}</NuxtLinkLocale></td>
              <td class="py-2.5 pr-3"><NuxtLinkLocale :to="`/moves/${machine.move}`" class="font-semibold">{{ labels.move(machine.move) }}</NuxtLinkLocale></td>
              <td class="py-2.5 pr-3"><TypeBadge v-if="machine.row" :type="machine.row.type" size="sm" /></td>
              <td class="py-2.5 pr-3 text-right tabular-nums">{{ machine.row?.power ?? '–' }}</td>
              <td class="py-2.5 text-right tabular-nums">{{ machine.row?.accuracy ?? '–' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </article>
</template>
