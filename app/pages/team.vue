<script setup lang="ts">
useSeoMeta({
  title: 'Team builder | Bokedex',
  description: 'Build a team of six and see its shared weaknesses and type coverage.',
})

const collection = useCollectionStore()
const { pokemon, byId } = useDex()
const sprites = useSprites()

const members = computed(() => collection.team.flatMap((id) => {
  const entry = byId.value.get(id)
  return entry ? [entry] : []
}))
const emptySlots = computed(() => Math.max(0, TEAM_SIZE - members.value.length))

const { defense, covered, uncovered } = useTeamAnalysis(members)
const risky = computed(() => defense.value.filter(row => row.risky))

const pickerOpen = ref(false)

function randomTeam() {
  collection.setTeam(sample(pokemon.value, TEAM_SIZE).map(entry => entry.id))
}
</script>

<template>
  <div class="space-y-8">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div class="max-w-2xl space-y-2">
        <h1 class="text-5xl font-extrabold">Team builder</h1>
        <p class="text-lg text-muted">
          Pick up to six Pokémon. Bokedex shows which attack types threaten the team and which types it can hit hard.
        </p>
      </div>
      <div class="flex gap-3">
        <button type="button" class="btn btn-ghost" :disabled="!pokemon.length" @click="randomTeam">
          <AppIcon name="refresh" :size="18" />
          Random team
        </button>
        <button type="button" class="btn btn-ghost" :disabled="!members.length" @click="collection.clearTeam()">Clear team</button>
      </div>
    </header>

    <section aria-label="Your team">
      <TransitionGroup tag="ul" name="list" class="relative grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <li v-for="member in members" :key="member.id" :style="pokemonTheme(member.types)">
          <div class="panel relative flex h-full flex-col items-center p-4 text-center" :style="{ backgroundImage: 'radial-gradient(100% 80% at 50% 0%, color-mix(in oklab, var(--poke) 30%, transparent), transparent 75%)' }">
            <button
              type="button"
              class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-surface/80 text-muted transition-colors hover:text-brand"
              :aria-label="`Remove ${titleCase(member.name)} from team`"
              @click="collection.removeFromTeam(member.id)"
            >
              <AppIcon name="x" :size="16" />
            </button>
            <NuxtLink :to="`/pokemon/${member.id}`" class="group flex flex-col items-center">
              <img :src="sprites.artwork(member.id)" :alt="titleCase(member.name)" width="120" height="120" class="h-28 w-28 object-contain drop-shadow-[0_10px_8px_rgb(0_0_0/0.25)] transition-transform group-hover:scale-110">
              <span class="mt-1 font-bold">{{ titleCase(member.name) }}</span>
            </NuxtLink>
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
            <span class="flex items-center gap-1 text-sm font-semibold"><AppIcon name="plus" :size="16" /> Add Pokémon</span>
          </button>
        </li>
      </TransitionGroup>
    </section>

    <template v-if="members.length">
      <section class="panel space-y-4 p-6" aria-labelledby="threats-heading">
        <h2 id="threats-heading" class="text-2xl font-bold">Defensive holes</h2>
        <p v-if="!risky.length" class="text-good font-semibold">No type threatens this team more than it resists.</p>
        <p v-else class="text-muted">
          More of your team is weak to these types than resists them. Plan around them or add a Pokémon that resists them.
        </p>
        <ul class="flex flex-wrap gap-2">
          <li v-for="row in risky" :key="row.type" class="flex items-center gap-2 rounded-full bg-surface-2 py-1 pl-1 pr-3 text-sm">
            <TypeBadge :type="row.type" size="sm" />
            <span class="text-bad font-semibold">{{ row.weak }} weak</span>
            <span class="text-muted">{{ row.resist }} resist</span>
          </li>
        </ul>
      </section>

      <section class="panel space-y-4 p-6" aria-labelledby="coverage-heading">
        <h2 id="coverage-heading" class="text-2xl font-bold">Offensive coverage</h2>
        <p class="text-muted">Types your team hits for super-effective damage using its own types. {{ covered.size }} of {{ covered.size + uncovered.length }} covered.</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="row in defense"
            :key="row.type"
            :class="covered.has(row.type) ? '' : 'opacity-30'"
          >
            <TypeBadge :type="row.type" size="sm" />
          </span>
        </div>
        <p v-if="uncovered.length" class="text-sm text-muted">
          Not covered: {{ uncovered.map(titleCase).join(', ') }}. Teach a move of another type to fill the gap.
        </p>
      </section>

      <section class="panel p-6" aria-labelledby="matrix-heading">
        <h2 id="matrix-heading" class="mb-4 text-2xl font-bold">Weakness breakdown</h2>
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-9">
          <div v-for="row in defense" :key="row.type" class="flex flex-col items-center gap-1.5 rounded-2xl bg-surface-2 p-2">
            <TypeBadge :type="row.type" size="sm" />
            <p class="text-xs">
              <span :class="row.weak ? 'text-bad font-bold' : 'text-muted'">{{ row.weak }}</span>
              <span class="text-muted"> / </span>
              <span :class="row.resist ? 'text-good font-bold' : 'text-muted'">{{ row.resist }}</span>
            </p>
          </div>
        </div>
        <p class="mt-3 text-sm text-muted">Each tile shows team members weak to the type, then those that resist it.</p>
      </section>
    </template>

    <EmptyState
      v-else
      icon="team"
      title="Your team is empty"
      message="Add a Pokémon to see weaknesses and coverage, or start from a random team."
      action="Add Pokémon"
      @action="pickerOpen = true"
    />

    <PokemonPicker v-model:open="pickerOpen" :disabled-ids="collection.team" @select="collection.addToTeam($event)" />
  </div>
</template>
