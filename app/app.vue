<script setup lang="ts">
// Language, canonical URL and hreflang alternates for every page.
const head = useLocaleHead({ dir: true, seo: true })
const { t } = useI18n()

useHead(() => ({
  htmlAttrs: { lang: head.value.htmlAttrs?.lang, dir: head.value.htmlAttrs?.dir },
  link: head.value.link ?? [],
  meta: head.value.meta ?? [],
  // Applies the saved theme before first paint so dark-mode users never see a flash of light.
  script: [{
    innerHTML: `try{var m=localStorage.getItem('vueuse-color-scheme');var d=m==='dark'||(m!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}`,
    tagPosition: 'head',
  }],
}))

useSeoMeta({
  description: () => t('seo.description'),
  ogSiteName: 'Bokedex',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
