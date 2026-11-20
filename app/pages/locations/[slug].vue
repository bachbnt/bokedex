<script setup lang="ts">
import type { EncounterGroup } from '#shared/types/encyclopedia'

const { t } = useI18n()
const route = useRoute()
const sprites = useSprites()
const { name, altName } = useL10n()
const { entity: location, refs } = await useEntity('locations', () => String(route.params.slug))
const labels = useLabels(refs)

useSeoMeta({ title: () => `${name(location.value.names)} | Bokedex`, description: () => t('locations.seoFallback', { name: name(location.value.names) }) })
useEntitySchema('locations', {
  name: () => name(location.value.names),
  alternateName: () => altName(location.value.names),
})

// Games in release order: the page's version labels arrive in that order.
const versionOrder = computed(() => new Map(Object.keys(refs.value.taxonomy.version ?? {}).map((slug, index) => [slug, index])))
const versions = computed(() => [...new Set(location.value.areas.flatMap(area => area.encounters.flatMap(encounter => encounter.versions)))]
  .sort((a, b) => (versionOrder.value.get(a) ?? 0) - (versionOrder.value.get(b) ?? 0)))

const version = ref('')
watch(versions, (list) => { if (!list.includes(version.value)) version.value = list[0] ?? '' }, { immediate: true })

const areas = computed(() => location.value.areas
  .map(area => ({ area, rows: area.encounters.filter(encounter => encounter.versions.includes(version.value)) }))
  .filter(entry => entry.rows.length))

const levels = (encounter: EncounterGroup) => (encounter.minLevel === encounter.maxLevel ? `Lv. ${encounter.minLevel}` : `Lv. ${encounter.minLevel}–${encounter.maxLevel}`)
const pokemonName = (id: number) => (refs.value.pokemon[id] ? name(refs.value.pokemon[id]!.names) : padDexId(id))
</script>

<template>
  <article class="space-y-6">
    <NuxtLinkLocale to="/locations" class="btn btn-ghost w-fit !px-4">
      <AppIcon name="arrow-left" :size="18" />
      {{ t('locations.listTitle') }}
    </NuxtLinkLocale>

    <EntityHeader :names="location.names" :kicker="t('locations.kicker')">
      <NuxtLinkLocale v-if="location.region" :to="`/regions/${location.region}`" class="chip">{{ labels.taxonomy('region', location.region) }}</NuxtLinkLocale>
    </EntityHeader>

    <section class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('locations.wildPokemon') }}</h2>
      <p v-if="!versions.length" class="text-muted">{{ t('locations.noEncounters') }}</p>
      <template v-else>
        <label class="mb-5 flex items-center gap-2 text-sm">
          <span class="text-muted">{{ t('moves.game') }}</span>
          <select v-model="version" class="input !w-auto cursor-pointer">
            <option v-for="option in versions" :key="option" :value="option">{{ labels.taxonomy('version', option) }}</option>
          </select>
        </label>

        <div v-for="{ area, rows } in areas" :key="area.slug" class="mb-6 last:mb-0">
          <h3 v-if="location.areas.length > 1" class="mb-2 font-display text-lg font-bold">{{ name(area.names) }}<span v-if="altName(area.names)" class="ml-2 text-sm font-normal text-muted">{{ altName(area.names) }}</span></h3>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[32rem] text-left text-sm">
              <thead class="text-muted">
                <tr class="border-b border-line">
                  <th class="py-2 pr-3 font-medium">{{ t('locations.pokemon') }}</th>
                  <th class="py-2 pr-3 font-medium">{{ t('encounters.method') }}</th>
                  <th class="py-2 pr-3 font-medium">{{ t('encounters.levels') }}</th>
                  <th class="py-2 text-right font-medium">{{ t('encounters.chance') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(encounter, index) in rows" :key="index" class="border-b border-line/60 align-top last:border-0">
                  <td class="py-2 pr-3">
                    <NuxtLinkLocale :to="`/pokemon/${encounter.pokemon}`" class="flex items-center gap-2 font-semibold">
                      <img :src="sprites.pixel(encounter.pokemon)" alt="" width="40" height="40" loading="lazy" class="h-10 w-10 [image-rendering:pixelated]">
                      <span class="underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">{{ pokemonName(encounter.pokemon) }}</span>
                    </NuxtLinkLocale>
                  </td>
                  <td class="py-2 pr-3">
                    {{ labels.taxonomy('encounter-method', encounter.method) }}
                    <span v-if="encounter.conditions.length" class="block text-xs text-muted">{{ encounter.conditions.map(condition => labels.taxonomy('encounter-condition', condition)).join(t('common.listSeparator')) }}</span>
                  </td>
                  <td class="py-2 pr-3 tabular-nums">{{ levels(encounter) }}</td>
                  <td class="py-2 text-right tabular-nums">{{ encounter.chance }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </section>
  </article>
</template>
