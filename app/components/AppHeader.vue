<script setup lang="ts">
const { t } = useI18n()
const isDark = useDark({ selector: 'html', valueDark: 'dark', valueLight: '' })
const toggleDark = useToggle(isDark)
const searchOpen = useState('search:open', () => false)
const collection = useCollectionStore()
const barePath = useBarePath()
const moreOpen = ref(false)

const moreActive = computed(() => MORE_NAV.some(item => isNavActive(item.to, barePath.value)))
watch(barePath, () => { moreOpen.value = false })
onKeyStroke('Escape', () => { moreOpen.value = false })
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
      <NuxtLinkLocale to="/" class="group flex items-center gap-2.5" :aria-label="t('nav.home')">
        <span class="transition-transform duration-300 group-hover:rotate-[360deg]">
          <PokeBall :size="34" />
        </span>
        <span class="font-display text-2xl font-extrabold tracking-tight">Bokedex</span>
      </NuxtLinkLocale>

      <nav class="hidden items-center gap-1 lg:flex" :aria-label="t('nav.main')">
        <NuxtLinkLocale
          v-for="item in PRIMARY_NAV"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors"
          :class="isNavActive(item.to, barePath) ? 'bg-ink text-bg' : 'text-muted hover:text-ink'"
        >
          <AppIcon :name="item.icon" :size="17" />
          {{ t(item.label) }}
          <span
            v-if="item.to === '/team' && collection.team.length"
            class="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-xs font-bold text-brand-ink"
          >
            {{ collection.team.length }}
          </span>
        </NuxtLinkLocale>

        <div v-if="MORE_NAV.length" class="relative">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors"
            :class="moreActive ? 'bg-ink text-bg' : 'text-muted hover:text-ink'"
            :aria-expanded="moreOpen"
            aria-haspopup="menu"
            @click="moreOpen = !moreOpen"
          >
            {{ t('nav.more') }}
            <AppIcon name="chevron-down" :size="15" />
          </button>
          <div
            v-if="moreOpen"
            class="panel absolute right-0 top-full mt-2 grid w-64 gap-1 p-2"
            role="menu"
          >
            <NuxtLinkLocale
              v-for="item in MORE_NAV"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium hover:bg-surface-2"
              role="menuitem"
            >
              <AppIcon :name="item.icon" :size="17" class="text-muted" />
              {{ t(item.label) }}
            </NuxtLinkLocale>
          </div>
        </div>
      </nav>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm text-muted transition-colors hover:text-ink sm:min-w-44"
          :aria-label="t('search.open')"
          @click="searchOpen = true"
        >
          <AppIcon name="search" :size="17" />
          <span class="hidden sm:inline">{{ t('search.short') }}</span>
          <kbd class="ml-auto hidden rounded-md border border-line px-1.5 text-xs sm:block">⌘K</kbd>
        </button>
        <LocaleSwitcher />
        <ClientOnly>
          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink transition-transform hover:rotate-12"
            :aria-label="isDark ? t('theme.toLight') : t('theme.toDark')"
            @click="toggleDark()"
          >
            <AppIcon :name="isDark ? 'sun' : 'moon'" />
          </button>
          <template #fallback>
            <span class="h-10 w-10" />
          </template>
        </ClientOnly>
      </div>
    </div>
  </header>
</template>
