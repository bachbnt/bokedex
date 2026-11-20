<script setup lang="ts">
const props = defineProps<{ types: string[] }>()

const { groupDefense, status } = useTypeChart()

const groups = computed(() => {
  const { quadruple, double, half, quarter, immune } = groupDefense(props.types)
  return [
    { label: 'Takes extra damage from', tone: 'text-bad', rows: [{ list: quadruple, value: 4 }, { list: double, value: 2 }] },
    { label: 'Resists', tone: 'text-good', rows: [{ list: half, value: 0.5 }, { list: quarter, value: 0.25 }] },
    { label: 'Immune to', tone: 'text-muted', rows: [{ list: immune, value: 0 }] },
  ].filter(group => group.rows.some(row => row.list.length))
})
</script>

<template>
  <div class="space-y-4">
    <div v-if="status === 'pending'" class="skeleton h-28" />
    <template v-else>
      <section v-for="group in groups" :key="group.label">
        <h3 class="mb-2 text-sm font-semibold" :class="group.tone">{{ group.label }}</h3>
        <div class="flex flex-wrap gap-2">
          <template v-for="row in group.rows" :key="row.value">
            <TypeBadge v-for="type in row.list" :key="type" :type="type" size="sm" :multiplier="row.value" />
          </template>
        </div>
      </section>
      <p v-if="!groups.length" class="text-muted">No special weaknesses or resistances.</p>
    </template>
  </div>
</template>
