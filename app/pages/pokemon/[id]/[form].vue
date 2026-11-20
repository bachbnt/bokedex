<script setup lang="ts">
const route = useRoute()
const formSlug = computed(() => String(route.params.form))
</script>

<template>
  <PokemonPage :key="formSlug" :form-slug="formSlug" />
</template>
