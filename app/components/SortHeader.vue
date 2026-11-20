<script setup lang="ts">
const props = defineProps<{
  label: string
  column: string
  sort: string
  descending: boolean
  align?: 'left' | 'right'
}>()

const emit = defineEmits<{ sort: [column: string] }>()
const active = computed(() => props.sort === props.column)
</script>

<template>
  <th class="py-2 pr-3 font-medium" :class="align === 'right' ? 'text-right' : ''" :aria-sort="active ? (descending ? 'descending' : 'ascending') : 'none'">
    <button type="button" class="inline-flex items-center gap-1 hover:text-ink" :class="active ? 'text-ink' : ''" @click="emit('sort', column)">
      {{ label }}
      <span aria-hidden="true" class="text-xs">{{ active ? (descending ? '↓' : '↑') : '' }}</span>
    </button>
  </th>
</template>
