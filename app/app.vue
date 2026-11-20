<script setup lang="ts">
// Applies the saved theme before first paint so dark-mode users never see a flash of light.
useHead({
  script: [{
    innerHTML: `try{var m=localStorage.getItem('vueuse-color-scheme');var d=m==='dark'||(m!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}`,
    tagPosition: 'head',
  }],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
