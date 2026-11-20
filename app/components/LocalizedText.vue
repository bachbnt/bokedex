<script setup lang="ts">
import type { Text } from '#shared/types/encyclopedia'

const props = defineProps<{ value: Text | null | undefined }>()

const { t } = useI18n()
const { text, locale } = useL10n()
const picked = computed(() => text(props.value))
const isFallback = computed(() => picked.value && picked.value.language !== locale.value)
</script>

<template>
  <span v-if="picked" :lang="picked.language">
    {{ picked.value }}
    <abbr v-if="isFallback" class="ml-1 cursor-help rounded bg-surface-2 px-1 text-[0.65em] font-semibold text-muted no-underline" :title="t('common.shownInEnglish')">EN</abbr>
  </span>
</template>
