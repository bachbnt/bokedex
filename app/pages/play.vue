<script setup lang="ts">
useSeoMeta({
  title: 'Play | Bokedex',
  description: 'Two quick Pokémon quizzes: name the silhouette and master the type chart.',
})

const GAMES = [
  { key: 'silhouette', label: "Who's that Pokémon?", icon: 'sparkle' },
  { key: 'typeMaster', label: 'Type master', icon: 'bolt' },
] as const

type ActiveGame = (typeof GAMES)[number]['key']

const route = useRoute()
const router = useRouter()

const isGameKey = (value: unknown): value is ActiveGame => GAMES.some(game => game.key === value)

const active = ref<ActiveGame>('silhouette')

// Follow the URL with a watcher: on a prerendered page Nuxt hydrates with the query stripped,
// then applies the real one, so reading it once at setup would miss `?game=typeMaster`.
watch(() => route.query.game, (game) => {
  if (isGameKey(game)) active.value = game
}, { immediate: true })

watch(active, game => router.replace({ query: { game } }))

// Both games need the dex and the chart; load once here so each game starts instantly.
const { status } = useDex()
</script>

<template>
  <div class="space-y-8">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">Play</h1>
      <p class="text-lg text-muted">Quick rounds built from live Pokédex data. New Pokémon join the quiz as soon as they appear in the Pokédex.</p>
    </header>

    <div class="inline-flex rounded-full border border-line bg-surface p-1" role="tablist" aria-label="Choose a game">
      <button
        v-for="game in GAMES"
        :key="game.key"
        type="button"
        role="tab"
        class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
        :class="active === game.key ? 'bg-ink text-bg' : 'text-muted hover:text-ink'"
        :aria-selected="active === game.key"
        @click="active = game.key"
      >
        <AppIcon :name="game.icon" :size="16" />
        {{ game.label }}
      </button>
    </div>

    <div v-if="status === 'pending'" class="skeleton h-96" />
    <ClientOnly v-else>
      <GameSilhouette v-if="active === 'silhouette'" />
      <GameTypeMaster v-else />
      <template #fallback>
        <div class="skeleton h-96" />
      </template>
    </ClientOnly>
  </div>
</template>
