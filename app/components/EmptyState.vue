<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  message: string
  action?: string
}>()

defineEmits<{ action: [] }>()
</script>

<template>
  <div class="panel mx-auto flex max-w-md flex-col items-center gap-3 p-10 text-center">
    <span class="grid h-14 w-14 place-items-center rounded-full bg-surface-2 text-muted">
      <AppIcon :name="icon" :size="26" />
    </span>
    <h2 class="text-2xl font-bold">{{ title }}</h2>
    <p class="text-muted">{{ message }}</p>
    <button v-if="action" type="button" class="btn btn-brand mt-2" @click="$emit('action')">{{ action }}</button>
  </div>
</template>
