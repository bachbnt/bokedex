<script setup lang="ts">
const { t } = useI18n()
const { name, altName } = useL10n()
const collection = useCollectionStore()
const { pokemon, byId } = useDex()
const sprites = useSprites()

useSeoMeta({ title: () => `${t('team.title')} | Bokedex`, description: () => t('team.description') })

const members = computed(() => collection.team.flatMap((id) => {
  const entry = byId.value.get(id)
  return entry ? [entry] : []
}))
const emptySlots = computed(() => Math.max(0, TEAM_SIZE - members.value.length))

const { defense, covered, uncovered } = useTeamAnalysis(members)
const labels = useLabels()
const risky = computed(() => defense.value.filter(row => row.risky))

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

    <PokemonPicker v-model:open="pickerOpen" :disabled-ids="collection.team" @select="collection.addToTeam($event)" />
  </div>
</template>
