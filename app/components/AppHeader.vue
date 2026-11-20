<script setup lang="ts">
const isDark = useDark({ selector: 'html', valueDark: 'dark', valueLight: '' })
const toggleDark = useToggle(isDark)
const collection = useCollectionStore()
const route = useRoute()

const isActive = (to: string) => (to === '/' ? route.path === '/' || route.path.startsWith('/pokemon') : route.path.startsWith(to))
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
      <NuxtLink to="/" class="group flex items-center gap-2.5" aria-label="Bokedex home">
        <span class="transition-transform duration-300 group-hover:rotate-[360deg]">
          <PokeBall :size="34" />
        </span>
        <span class="font-display text-2xl font-extrabold tracking-tight">Bokedex</span>
      </NuxtLink>

      <nav class="hidden items-center gap-1 md:flex" aria-label="Main">
        <NuxtLink
          v-for="item in NAV_ITEMS"
          :key="item.to"
          :to="item.to"
          class="relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
          :class="isActive(item.to) ? 'bg-ink text-bg' : 'text-muted hover:text-ink'"
        >
          <AppIcon :name="item.icon" :size="17" />
          {{ item.label }}
          <span
            v-if="item.to === '/team' && collection.team.length"
            class="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-xs font-bold text-brand-ink"
          >
            {{ collection.team.length }}
          </span>
        </NuxtLink>
      </nav>

      <ClientOnly>
        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink transition-transform hover:rotate-12"
          :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
          @click="toggleDark()"
        >
          <AppIcon :name="isDark ? 'sun' : 'moon'" />
        </button>
        <template #fallback>
          <span class="h-10 w-10" />
        </template>
      </ClientOnly>
    </div>
  </header>
</template>
