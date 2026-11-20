<script setup lang="ts">
import type { AbilityRow, PokemonRow } from '#shared/types/encyclopedia'

const { t } = useI18n()
const { name, altName } = useL10n()
const collection = useCollectionStore()
const { pokemon, byId } = useDex()
const sprites = useSprites()
const { refs } = useTaxonomyRefs()
const { reference } = useReference()
const { data: table } = useDataset<PokemonRow[]>('pokemon-table')
const { data: abilityRows } = useDataset<AbilityRow[]>('abilities')

useSeoMeta({ title: () => `${t('team.title')} | Bokedex`, description: () => t('team.description') })

const members = computed(() => collection.team.flatMap((id) => {
  const entry = byId.value.get(id)
  return entry ? [entry] : []
}))
const emptySlots = computed(() => Math.max(0, TEAM_SIZE - members.value.length))

const labels = useLabels(refs)
const builds = computed(() => new Map(members.value.map(member => [member.id, collection.buildOf(member.id)])))
const { defense, covered, uncovered } = useTeamAnalysis(() => members.value.map(member => ({ types: member.types, tera: builds.value.get(member.id)?.tera })))
const risky = computed(() => defense.value.filter(row => row.risky))

const rowById = computed(() => new Map((table.value ?? []).map(row => [row.id, row])))
const natureOf = (slug: string | null) => reference.value?.natures.find(entry => entry.slug === slug)
const abilityName = (slug: string) => {
  const row = abilityRows.value?.find(entry => entry.slug === slug)
  return row ? name(row.names) : titleCase(slug)
}

/** The shape of each member's build in one line: nature, ability and level. */
function buildSummary(id: number) {
  const build = builds.value.get(id)
  if (!build) return ''
  const nature = natureOf(build.nature)
  return [nature ? name(nature.names) : '', build.ability ? abilityName(build.ability) : '', t('team.build.level', { level: build.level })].filter(Boolean).join(' · ')
}

/** Real stats for each member, with the best of each column marked. */
const statRows = computed(() => members.value.flatMap((member) => {
  const row = rowById.value.get(member.id)
  const build = builds.value.get(member.id)
  if (!row || !build) return []
  const stats = buildStats(row.stats, build, natureOf(build.nature), row.slug === 'shedinja')
  return [{ member, stats, total: stats.reduce((sum, value) => sum + value, 0) }]
}))
const bestOf = (index: number) => Math.max(...statRows.value.map(row => row.stats[index] ?? 0))

const editingId = ref<number | null>(null)
const editOpen = ref(false)
const editing = computed(() => (editingId.value === null ? null : rowById.value.get(editingId.value) ?? null))
const editBuild = (id: number) => { editingId.value = id; editOpen.value = true }

const pickerOpen = ref(false)
const randomTeam = () => collection.setTeam(sample(pokemon.value, TEAM_SIZE).map(entry => entry.id))
</script>

<template>
  <div class="space-y-8">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div class="max-w-2xl space-y-2">
        <h1 class="text-5xl font-extrabold">{{ t('team.title') }}</h1>
        <p class="text-lg text-muted">{{ t('team.lead') }}</p>
      </div>
      <div class="flex gap-3">
        <button type="button" class="btn btn-ghost" :disabled="!pokemon.length" @click="randomTeam">
          <AppIcon name="refresh" :size="18" />
          {{ t('team.random') }}
        </button>
        <button type="button" class="btn btn-ghost" :disabled="!members.length" @click="collection.clearTeam()">{{ t('team.clear') }}</button>
      </div>
    </header>

    <section :aria-label="t('team.yourTeam')">
      <TransitionGroup tag="ul" name="list" class="relative grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <li v-for="member in members" :key="member.id" :style="pokemonTheme(member.types)">
          <div class="panel relative flex h-full flex-col items-center p-4 text-center" :style="{ backgroundImage: 'radial-gradient(100% 80% at 50% 0%, color-mix(in oklab, var(--poke) 30%, transparent), transparent 75%)' }">
            <button
              type="button"
              class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-surface/80 text-muted transition-colors hover:text-brand"
              :aria-label="t('team.remove', { name: name(member.names) })"
              @click="collection.removeFromTeam(member.id)"
            >
              <AppIcon name="x" :size="16" />
            </button>
            <NuxtLinkLocale :to="`/pokemon/${member.id}`" class="group flex flex-col items-center">
              <img :src="sprites.artwork(member.id)" :alt="name(member.names)" width="120" height="120" class="h-28 w-28 object-contain drop-shadow-[0_10px_8px_rgb(0_0_0/0.25)] transition-transform group-hover:scale-110">
              <span class="mt-1 font-bold">{{ name(member.names) }}</span>
              <span v-if="altName(member.names)" class="text-xs text-muted">{{ altName(member.names) }}</span>
            </NuxtLinkLocale>
            <div class="mt-2 flex flex-wrap justify-center gap-1">
              <TypeBadge v-for="type in member.types" :key="type" :type="type" size="sm" />
            </div>
            <p v-if="builds.get(member.id)?.tera" class="mt-2 flex items-center gap-1.5 text-xs text-muted">
              {{ t('team.build.teraShort') }}
              <TypeBadge :type="builds.get(member.id)!.tera!" size="sm" />
            </p>
            <p class="mt-2 text-xs text-muted">{{ buildSummary(member.id) }}</p>
            <button type="button" class="btn btn-ghost mt-3 !px-4 !py-1.5 text-sm" :disabled="!rowById.has(member.id)" @click="editBuild(member.id)">
              <AppIcon name="sparkle" :size="14" />
              {{ t('team.build.edit') }}
            </button>
          </div>
        </li>
        <li v-for="n in emptySlots" :key="`empty-${n}`">
          <button
            type="button"
            class="flex h-full min-h-48 w-full flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-line text-muted transition-colors hover:border-muted hover:text-ink"
            @click="pickerOpen = true"
          >
            <PokeBall :size="40" class="opacity-60" />
            <span class="flex items-center gap-1 text-sm font-semibold"><AppIcon name="plus" :size="16" /> {{ t('team.add') }}</span>
          </button>
        </li>
      </TransitionGroup>
    </section>

    <template v-if="members.length">
      <section v-if="statRows.length" class="panel p-6" aria-labelledby="stats-heading">
        <h2 id="stats-heading" class="text-2xl font-bold">{{ t('team.statsTitle') }}</h2>
        <p class="mb-4 mt-1 text-sm text-muted">{{ t('team.statsHint') }}</p>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[34rem] text-left text-sm">
            <thead class="text-muted">
              <tr class="border-b border-line">
                <th scope="col" class="py-2 pr-3 font-medium">{{ t('team.statsPokemon') }}</th>
                <th v-for="stat in STAT_KEYS" :key="stat" scope="col" class="py-2 pr-3 text-right font-medium">{{ labels.taxonomy('stat', stat) }}</th>
                <th scope="col" class="py-2 text-right font-medium">{{ t('pokemon.statTotal') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in statRows" :key="row.member.id" class="border-b border-line/60 last:border-0">
                <th scope="row" class="py-2.5 pr-3 text-left font-semibold">{{ name(row.member.names) }}</th>
                <td v-for="(value, index) in row.stats" :key="index" class="py-2.5 pr-3 text-right tabular-nums" :class="value === bestOf(index) && statRows.length > 1 ? 'font-bold text-good' : ''">{{ value }}</td>
                <td class="py-2.5 text-right font-bold tabular-nums">{{ row.total }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel space-y-4 p-6" aria-labelledby="threats-heading">
        <h2 id="threats-heading" class="text-2xl font-bold">{{ t('team.holes') }}</h2>
        <p v-if="!risky.length" class="font-semibold text-good">{{ t('team.noHoles') }}</p>
        <p v-else class="text-muted">{{ t('team.holesHint') }}</p>
        <ul class="flex flex-wrap gap-2">
          <li v-for="row in risky" :key="row.type" class="flex items-center gap-2 rounded-full bg-surface-2 py-1 pl-1 pr-3 text-sm">
            <TypeBadge :type="row.type" size="sm" />
            <span class="font-semibold text-bad">{{ t('team.weakCount', { count: row.weak }) }}</span>
            <span class="text-muted">{{ t('team.resistCount', { count: row.resist }) }}</span>
          </li>
        </ul>
      </section>

      <section class="panel space-y-4 p-6" aria-labelledby="coverage-heading">
        <h2 id="coverage-heading" class="text-2xl font-bold">{{ t('team.coverage') }}</h2>
        <p class="text-muted">{{ t('team.coverageHint', { covered: covered.size, total: covered.size + uncovered.length }) }}</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="row in defense" :key="row.type" :class="covered.has(row.type) ? '' : 'opacity-30'">
            <TypeBadge :type="row.type" size="sm" />
          </span>
        </div>
        <p v-if="uncovered.length" class="text-sm text-muted">{{ t('team.notCovered', { types: uncovered.map(labels.type).join(t('common.listSeparator')) }) }}</p>
      </section>

      <section class="panel p-6" aria-labelledby="matrix-heading">
        <h2 id="matrix-heading" class="mb-4 text-2xl font-bold">{{ t('team.breakdown') }}</h2>
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-9">
          <div v-for="row in defense" :key="row.type" class="flex flex-col items-center gap-1.5 rounded-2xl bg-surface-2 p-2">
            <TypeBadge :type="row.type" size="sm" />
            <p class="text-xs">
              <span :class="row.weak ? 'font-bold text-bad' : 'text-muted'">{{ row.weak }}</span>
              <span class="text-muted"> / </span>
              <span :class="row.resist ? 'font-bold text-good' : 'text-muted'">{{ row.resist }}</span>
            </p>
          </div>
        </div>
        <p class="mt-3 text-sm text-muted">{{ t('team.breakdownHint') }}</p>
      </section>
    </template>

    <EmptyState v-else icon="team" :title="t('team.emptyTitle')" :message="t('team.emptyMessage')" :action="t('team.add')" @action="pickerOpen = true" />

    <TeamBuildDialog v-model:open="editOpen" :pokemon="editing" :build="editing ? collection.buildOf(editing.id) : defaultBuild()" @save="editing && collection.setBuild(editing.id, $event)" />
    <PokemonPicker v-model:open="pickerOpen" :disabled-ids="collection.team" @select="collection.addToTeam($event)" />
  </div>
</template>
