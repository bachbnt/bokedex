<script setup lang="ts">
import type { PokemonMoves } from '#shared/types/pokedex'

defineProps<{
  moves: PokemonMoves | null | undefined
  loading: boolean
  failed: boolean
}>()

defineEmits<{ retry: [] }>()

const CLASS_STYLES: Record<string, string> = {
  physical: 'bg-[#c22e28] text-white',
  special: 'bg-[#6390f0] text-white',
  status: 'bg-[#8a8fb8] text-white',
}
</script>

<template>
  <div>
    <div v-if="loading" class="space-y-2">
      <div v-for="n in 6" :key="n" class="skeleton h-10 !rounded-xl" />
    </div>

    <EmptyState
      v-else-if="failed"
      icon="refresh"
      title="Couldn't load moves"
      message="The data service didn't respond."
      action="Try again"
      @action="$emit('retry')"
    />

    <template v-else-if="moves">
      <p v-if="!moves.levelUp.length" class="text-muted">No level-up moves are listed for this Pokémon yet.</p>

      <div v-else class="overflow-x-auto">
        <p class="mb-3 text-sm text-muted">Level-up moves in {{ titleCase(moves.versionGroup) }}.</p>
        <table class="w-full min-w-[34rem] text-left text-sm">
          <thead class="text-muted">
            <tr class="border-b border-line">
              <th class="py-2 pr-3 font-medium">Lv.</th>
              <th class="py-2 pr-3 font-medium">Move</th>
              <th class="py-2 pr-3 font-medium">Type</th>
              <th class="py-2 pr-3 font-medium">Class</th>
              <th class="py-2 pr-3 text-right font-medium">Power</th>
              <th class="py-2 pr-3 text-right font-medium">Acc.</th>
              <th class="py-2 text-right font-medium">PP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="move in moves.levelUp" :key="`${move.name}-${move.level}`" class="border-b border-line/60 align-top last:border-0">
              <td class="py-2.5 pr-3 font-display font-bold tabular-nums">{{ move.level || '–' }}</td>
              <td class="py-2.5 pr-3">
                <span class="font-semibold">{{ titleCase(move.name) }}</span>
                <span v-if="move.effect" class="mt-0.5 hidden max-w-sm text-xs text-muted lg:block">{{ move.effect }}</span>
              </td>
              <td class="py-2.5 pr-3"><TypeBadge :type="move.type" size="sm" /></td>
              <td class="py-2.5 pr-3">
                <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="CLASS_STYLES[move.damageClass] ?? CLASS_STYLES.status">
                  {{ titleCase(move.damageClass) }}
                </span>
              </td>
              <td class="py-2.5 pr-3 text-right tabular-nums">{{ move.power ?? '–' }}</td>
              <td class="py-2.5 pr-3 text-right tabular-nums">{{ move.accuracy ?? '–' }}</td>
              <td class="py-2.5 text-right tabular-nums">{{ move.pp ?? '–' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <details v-if="moves.other.length" class="mt-4 rounded-2xl bg-surface-2 p-4">
        <summary class="cursor-pointer font-semibold">Also learns {{ moves.other.length }} more by TM, tutor or breeding</summary>
        <ul class="mt-3 flex flex-wrap gap-2">
          <li v-for="move in moves.other" :key="move.name" class="rounded-full border border-line bg-surface px-3 py-1 text-xs">
            {{ titleCase(move.name) }}
            <span class="text-muted">{{ titleCase(move.method) }}</span>
          </li>
        </ul>
      </details>
    </template>
  </div>
</template>
