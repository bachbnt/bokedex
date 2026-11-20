<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-glow focus:px-4 focus:py-2 focus:font-semibold focus:text-[#12163a]"
    >
      {{ t('nav.skip') }}
    </a>
    <AppHeader />
    <main id="main" class="mx-auto w-full max-w-7xl flex-1 px-4 pb-32 pt-8 sm:px-6 lg:pb-16">
      <slot />
    </main>
    <AppFooter />
    <MobileNav />
    <SearchDialog />
  </div>
</template>
