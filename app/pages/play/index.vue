<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

useSeoMeta({ title: () => `${t('play.title')} | Bokedex`, description: () => t('play.description') })

const GAMES = [
  { key: 'silhouette', label: 'play.silhouette', icon: 'sparkle' },
  { key: 'typeMaster', label: 'play.typeMaster', icon: 'bolt' },
] as const

type ActiveGame = (typeof GAMES)[number]['key']

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
      <h1 class="text-5xl font-extrabold">{{ t('play.title') }}</h1>
      <p class="text-lg text-muted">{{ t('play.lead') }}</p>
    </header>

    <div class="inline-flex rounded-full border border-line bg-surface p-1" role="tablist" :aria-label="t('play.choose')">
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
        {{ t(game.label) }}
      </button>
    </div>

    <div v-if="status === 'pending'" class="skeleton h-96" />
    <ClientOnly v-else>
      <QuizSilhouette v-if="active === 'silhouette'" />
      <QuizTypeMaster v-else />
      <template #fallback>
        <div class="skeleton h-96" />
      </template>
    </ClientOnly>
  </div>
</template>
