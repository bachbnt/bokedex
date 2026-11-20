<script setup lang="ts">
const collection = useCollectionStore()
const route = useRoute()

const isActive = (to: string) => (to === '/' ? route.path === '/' || route.path.startsWith('/pokemon') : route.path.startsWith(to))
</script>

<template>
  <nav
    class="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-full border border-line bg-surface/90 p-1.5 shadow-card backdrop-blur-xl md:hidden"
    aria-label="Main"
  >
    <NuxtLink
      v-for="item in NAV_ITEMS"
      :key="item.to"
      :to="item.to"
      class="relative flex min-w-16 flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
      :class="isActive(item.to) ? 'bg-ink text-bg' : 'text-muted'"
    >
      <AppIcon :name="item.icon" :size="20" />
      {{ item.label.split(' ')[0] }}
      <span
        v-if="item.to === '/team' && collection.team.length"
        class="absolute right-2 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[0.65rem] font-bold text-brand-ink"
      >
        {{ collection.team.length }}
      </span>
    </NuxtLink>
  </nav>
</template>
