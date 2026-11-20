<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <footer class="border-t border-line py-8 pb-28 text-sm text-muted lg:pb-8">
    <div class="mx-auto flex max-w-7xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p>
        {{ t('footer.data') }}
        <a class="font-medium text-ink underline decoration-brand decoration-2 underline-offset-4" href="https://pokeapi.co" target="_blank" rel="noopener">PokeAPI</a>.
        {{ t('footer.legal') }}
      </p>
      <p>{{ t('footer.built') }}</p>
    </div>
  </footer>
</template>
