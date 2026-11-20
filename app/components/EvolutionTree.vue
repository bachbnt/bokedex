<script setup lang="ts">
import type { EvolutionNode } from '#shared/types/encyclopedia'

const props = defineProps<{
  node: EvolutionNode
  currentId: number
}>()

const sprites = useSprites()
const labels = useLabels()
const { describe } = useEvolutionText()
const isCurrent = computed(() => props.node.id === props.currentId)
</script>

<template>
  <div class="flex items-center gap-3">
    <NuxtLinkLocale
      :to="`/pokemon/${node.id}`"
      class="group flex w-28 shrink-0 flex-col items-center rounded-2xl border p-2 text-center transition-all hover:-translate-y-1"
      :class="isCurrent ? 'border-poke bg-poke/10' : 'border-line bg-surface-2'"
      :aria-current="isCurrent ? 'page' : undefined"
    >
      <img :src="sprites.artwork(node.id)" :alt="labels.pokemon(node.id)" width="96" height="96" loading="lazy" class="h-24 w-24 object-contain transition-transform group-hover:scale-110">
      <span class="mt-1 text-sm font-semibold leading-tight">{{ labels.pokemon(node.id) }}</span>
      <span class="text-xs text-muted">{{ padDexId(node.id) }}</span>
    </NuxtLinkLocale>

    <div v-if="node.evolvesTo.length" class="flex flex-col gap-3">
      <div v-for="child in node.evolvesTo" :key="child.id" class="flex items-center gap-3">
        <div class="flex w-24 shrink-0 flex-col items-center gap-0.5 text-center text-xs text-muted">
          <AppIcon name="arrow-right" :size="18" />
          <span v-for="(way, index) in describe(child.details)" :key="index">{{ way }}</span>
        </div>
        <EvolutionTree :node="child" :current-id="currentId" />
      </div>
    </div>
  </div>
</template>
