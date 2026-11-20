<script setup lang="ts">
import type { FormKind, PokemonForm } from '#shared/types/encyclopedia'

const props = defineProps<{
  speciesId: number
  forms: PokemonForm[]
  current: string | null
}>()

const { t } = useI18n()
const { name } = useL10n()

/** Cosmetic-only variants are not worth a page of their own. */
const visible = computed(() => props.forms.filter(form => form.kind !== 'cosmetic'))

const label = (form: PokemonForm) => {
  if (form.kind === 'default') return t('pokemon.forms.default')
  const own = form.formNames ?? form.names
  return own ? name(own) : titleCase(form.formSlug ?? form.slug)
}
const kindLabel = (kind: FormKind) => t(`pokemon.forms.kind.${kind}`)
const href = (form: PokemonForm) => (form.formSlug ? `/pokemon/${props.speciesId}/${form.formSlug}` : `/pokemon/${props.speciesId}`)
</script>

<template>
  <nav v-if="visible.length > 1" :aria-label="t('pokemon.forms.title')" class="flex flex-wrap gap-2">
    <NuxtLinkLocale
      v-for="form in visible"
      :key="form.slug"
      :to="href(form)"
      class="chip"
      :aria-pressed="(form.formSlug ?? null) === current"
      :aria-current="(form.formSlug ?? null) === current ? 'page' : undefined"
    >
      {{ label(form) }}
      <span v-if="form.kind !== 'default'" class="rounded-full bg-black/10 px-1.5 py-0.5 text-[0.65rem] opacity-80">{{ kindLabel(form.kind) }}</span>
    </NuxtLinkLocale>
  </nav>
</template>
