<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()
const localePath = useLocalePath()
const isNotFound = computed(() => props.error.statusCode === 404)
const goHome = () => clearError({ redirect: localePath('/') })
</script>

<template>
  <NuxtLayout>
    <div class="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <PokeBall :size="96" shake />
      <h1 class="text-4xl font-extrabold">{{ isNotFound ? t('error.notFoundTitle') : t('error.genericTitle') }}</h1>
      <p class="text-muted">{{ isNotFound ? t('error.notFoundMessage') : (error.message || t('error.genericMessage')) }}</p>
      <button type="button" class="btn btn-brand" @click="goHome">{{ t('error.back') }}</button>
    </div>
  </NuxtLayout>
</template>
