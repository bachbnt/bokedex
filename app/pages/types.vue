<script setup lang="ts">
useSeoMeta({
  title: 'Type chart | Bokedex',
  description: 'Full Pokémon type effectiveness chart with a defensive matchup calculator.',
})

const { types } = useDex()

// Up to two defending types, like a real dual-typed Pokémon.
const selected = ref<string[]>([])

function toggle(type: string) {
  if (selected.value.includes(type)) selected.value = selected.value.filter(value => value !== type)
  else selected.value = [...selected.value, type].slice(-2)
}

const theme = computed(() => pokemonTheme(selected.value))
</script>

<template>
  <div class="space-y-8">
    <header class="max-w-2xl space-y-2">
      <h1 class="text-5xl font-extrabold">Type chart</h1>
      <p class="text-lg text-muted">
        Pick one or two types to see what hits them hardest. Hover the grid to trace any attack against any defender.
      </p>
    </header>

    <section class="panel space-y-5 p-6" :style="theme" aria-labelledby="calc-heading">
      <h2 id="calc-heading" class="text-2xl font-bold">Defensive calculator</h2>
      <div class="flex flex-wrap gap-2" role="group" aria-label="Defending types">
        <button
          v-for="type in types"
          :key="type"
          type="button"
          class="chip"
          :aria-pressed="selected.includes(type)"
          @click="toggle(type)"
        >
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: typeColor(type) }" />
          {{ titleCase(type) }}
        </button>
      </div>

      <div v-if="selected.length" class="border-t border-line pt-5">
        <p class="mb-3 flex flex-wrap items-center gap-2 font-semibold">
          A
          <TypeBadge v-for="type in selected" :key="type" :type="type" size="sm" />
          Pokémon
        </p>
        <TypeMatchups :types="selected" />
      </div>
      <p v-else class="border-t border-line pt-5 text-muted">Choose a type to begin.</p>
    </section>

    <TypeChartMatrix />
  </div>
</template>
