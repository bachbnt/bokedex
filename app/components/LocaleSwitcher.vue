<script setup lang="ts">
import type { Locale } from '#shared/types/encyclopedia'

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const { t } = useI18n()

const options = computed(() => locales.value.map(item => ({
  code: item.code as Locale,
  label: item.code === 'ja' ? '日本語' : 'EN',
  full: item.name ?? item.code,
})))
</script>

<template>
  <nav class="flex rounded-full border border-line bg-surface p-0.5" :aria-label="t('nav.language')">
    <NuxtLink
      v-for="option in options"
      :key="option.code"
      :to="switchLocalePath(option.code)"
      class="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
      :class="locale === option.code ? 'bg-ink text-bg' : 'text-muted hover:text-ink'"
      :hreflang="option.code"
      :lang="option.code"
      :aria-current="locale === option.code ? 'true' : undefined"
      :title="option.full"
    >
      {{ option.label }}
    </NuxtLink>
  </nav>
</template>
