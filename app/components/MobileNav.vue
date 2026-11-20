<script setup lang="ts">
const { t } = useI18n()
const collection = useCollectionStore()
const barePath = useBarePath()
const searchOpen = useState('search:open', () => false)
const sheetOpen = ref(false)
const moreActive = computed(() => MORE_NAV.some(item => isNavActive(item.to, barePath.value)))

watch(barePath, () => { sheetOpen.value = false })
</script>

<template>
  <div class="lg:hidden">
    <div
      v-if="sheetOpen"
      class="fixed inset-0 z-40 bg-[#0b0e26]/50 backdrop-blur-sm"
      @click="sheetOpen = false"
    />
    <div
      v-if="sheetOpen && MORE_NAV.length"
      class="panel fixed inset-x-3 bottom-24 z-50 grid max-h-[60dvh] grid-cols-2 gap-1 overflow-y-auto p-2"
      role="menu"
    >
      <NuxtLinkLocale
        v-for="item in MORE_NAV"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium"
        :class="isNavActive(item.to, barePath) ? 'bg-ink text-bg' : 'hover:bg-surface-2'"
        :aria-current="isNavActive(item.to, barePath) ? 'page' : undefined"
        role="menuitem"
      >
        <AppIcon :name="item.icon" :size="18" :class="isNavActive(item.to, barePath) ? '' : 'text-muted'" />
        {{ t(item.label) }}
      </NuxtLinkLocale>
    </div>

    <nav
      class="fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-full border border-line bg-surface/90 p-1.5 shadow-card backdrop-blur-xl"
      :aria-label="t('nav.main')"
    >
      <NuxtLinkLocale
        v-for="item in MOBILE_NAV"
        :key="item.to"
        :to="item.to"
        class="relative flex min-w-14 flex-col items-center gap-0.5 rounded-full px-2.5 py-1.5 text-[0.7rem] font-semibold transition-colors"
        :class="isNavActive(item.to, barePath) ? 'bg-ink text-bg' : 'text-muted'"
      >
        <AppIcon :name="item.icon" :size="20" />
        {{ t(item.label) }}
        <span
          v-if="item.to === '/team' && collection.team.length"
          class="absolute right-1.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[0.65rem] font-bold text-brand-ink"
        >
          {{ collection.team.length }}
        </span>
      </NuxtLinkLocale>

      <button
        type="button"
        class="flex min-w-14 flex-col items-center gap-0.5 rounded-full px-2.5 py-1.5 text-[0.7rem] font-semibold text-muted"
        @click="searchOpen = true"
      >
        <AppIcon name="search" :size="20" />
        {{ t('search.short') }}
      </button>

      <button
        v-if="MORE_NAV.length"
        type="button"
        class="flex min-w-14 flex-col items-center gap-0.5 rounded-full px-2.5 py-1.5 text-[0.7rem] font-semibold transition-colors"
        :class="moreActive ? 'bg-ink text-bg' : 'text-muted'"
        :aria-expanded="sheetOpen"
        @click="sheetOpen = !sheetOpen"
      >
        <AppIcon name="menu" :size="20" />
        {{ t('nav.more') }}
      </button>
    </nav>
  </div>
</template>
