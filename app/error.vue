<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)
const goHome = () => clearError({ redirect: '/' })
</script>

<template>
  <NuxtLayout>
    <div class="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <PokeBall :size="96" shake />
      <h1 class="text-4xl font-extrabold">{{ isNotFound ? 'It got away!' : 'Something broke' }}</h1>
      <p class="text-muted">
        {{ isNotFound ? 'That page or Pokémon doesn’t exist in the Pokédex.' : (error.message || 'Unexpected error. Try again in a moment.') }}
      </p>
      <button type="button" class="btn btn-brand" @click="goHome">Back to the Pokédex</button>
    </div>
  </NuxtLayout>
</template>
