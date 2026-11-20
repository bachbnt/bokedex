<script setup lang="ts">
import type { EvolutionNode } from '#shared/types/pokedex'

const props = defineProps<{
  node: EvolutionNode
  currentId: number
}>()

const sprites = useSprites()
const isCurrent = computed(() => props.node.id === props.currentId)
</script>

<template>
  <div class="flex items-center gap-3">
    <NuxtLink
      :to="`/pokemon/${node.id}`"
      class="group flex w-28 shrink-0 flex-col items-center rounded-2xl border p-2 text-center transition-all hover:-translate-y-1"
      :class="isCurrent ? 'border-poke bg-poke/10' : 'border-line bg-surface-2'"
      :aria-current="isCurrent ? 'page' : undefined"
    >
      <img
        :src="sprites.artwork(node.id)"
        :alt="titleCase(node.name)"
        width="96"
        height="96"
        loading="lazy"
        class="h-24 w-24 object-contain transition-transform group-hover:scale-110"
      >
      <span class="mt-1 text-sm font-semibold leading-tight">{{ titleCase(node.name) }}</span>
      <span class="text-xs text-muted">{{ padDexId(node.id) }}</span>
    </NuxtLink>

    <div v-if="node.evolvesTo.length" class="flex flex-col gap-3">
      <div v-for="child in node.evolvesTo" :key="child.id" class="flex items-center gap-3">
        <div class="flex w-20 shrink-0 flex-col items-center gap-0.5 text-center text-xs text-muted">
          <AppIcon name="arrow-right" :size="18" />
          <span>{{ child.condition || 'Evolves' }}</span>
        </div>
        <EvolutionTree :node="child" :current-id="currentId" />
      </div>
    </div>
  </div>
</template>
