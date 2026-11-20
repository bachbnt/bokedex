<script setup lang="ts">
import type { HeldItem } from '#shared/types/encyclopedia'

defineProps<{ items: HeldItem[] }>()

const labels = useLabels()
const sprites = useSprites()
const { t } = useI18n()

const best = (item: HeldItem) => Math.max(...Object.values(item.rarity))
</script>

<template>
  <ul class="flex flex-wrap gap-3">
    <li v-for="item in items" :key="item.item">
      <NuxtLinkLocale :to="`/items/${item.item}`" class="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 px-3 py-2 hover:border-muted">
        <img :src="sprites.item(item.item)" alt="" width="32" height="32" class="h-8 w-8 [image-rendering:pixelated]" loading="lazy">
        <span>
          <span class="block font-semibold">{{ labels.item(item.item) }}</span>
          <span class="block text-xs text-muted">{{ t('pokemon.heldChance', { chance: best(item) }) }}</span>
        </span>
      </NuxtLinkLocale>
    </li>
  </ul>
</template>
