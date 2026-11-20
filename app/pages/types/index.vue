<script setup lang="ts">
const { t } = useI18n()
const labels = useLabels()
const { types } = useTypeChart()

useSeoMeta({ title: () => `${t('types.title')} | Bokedex`, description: () => t('types.description') })

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
      <h1 class="text-5xl font-extrabold">{{ t('types.title') }}</h1>
      <p class="text-lg text-muted">{{ t('types.lead') }}</p>
    </header>

    <section class="panel space-y-5 p-6" :style="theme" aria-labelledby="calc-heading">
      <h2 id="calc-heading" class="text-2xl font-bold">{{ t('types.calculator') }}</h2>
      <div class="flex flex-wrap gap-2" role="group" :aria-label="t('types.defending')">
        <button v-for="type in types" :key="type" type="button" class="chip" :aria-pressed="selected.includes(type)" @click="toggle(type)">
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: typeColor(type) }" />
          {{ labels.type(type) }}
        </button>
      </div>

      <div v-if="selected.length" class="border-t border-line pt-5">
        <p class="mb-3 flex flex-wrap items-center gap-2 font-semibold">
          {{ t('types.defendingAs') }}
          <TypeBadge v-for="type in selected" :key="type" :type="type" size="sm" />
        </p>
        <TypeMatchups :types="selected" />
      </div>
      <p v-else class="border-t border-line pt-5 text-muted">{{ t('types.choose') }}</p>
    </section>

    <TypeChartMatrix />
  </div>
</template>
