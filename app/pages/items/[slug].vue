<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const sprites = useSprites()
const { name, altName, locale } = useL10n()
const { entity: item, refs } = await useEntity('items', () => String(route.params.slug))
const labels = useLabels(refs)

useSeoMeta({
  title: () => `${name(item.value.names)} | Bokedex`,
  description: () => item.value.shortEffect[locale.value] ?? item.value.shortEffect.en ?? t('items.seoFallback', { name: name(item.value.names) }),
})
useEntitySchema('items', {
  name: () => name(item.value.names),
  alternateName: () => altName(item.value.names),
  description: () => item.value.shortEffect[locale.value] ?? item.value.shortEffect.en,
})

const facts = computed(() => {
  const value = item.value
  return [
    { label: t('items.cost'), value: value.cost ? value.cost.toLocaleString() : '–' },
    { label: t('items.fling'), value: value.flingPower === null ? '–' : String(value.flingPower) },
    ...(value.flingEffect ? [{ label: t('items.flingEffect'), value: labels.taxonomy('fling-effect', value.flingEffect) }] : []),
  ]
})
const notes = computed(() => Object.fromEntries(item.value.heldBy.map(entry => [entry.id, t('pokemon.heldChance', { chance: entry.chance })])))
const sameText = computed(() => item.value.effect.en === item.value.shortEffect.en)
const berryFacts = computed(() => {
  const berry = item.value.berry
  if (!berry) return []
  const num = (value: number | null, unit = '') => (value === null ? '–' : `${value}${unit}`)
  return [
    { label: t('berries.growthTime'), value: num(berry.growthTime, ' h') },
    { label: t('berries.maxHarvest'), value: num(berry.maxHarvest) },
    { label: t('berries.size'), value: num(berry.size, ' mm') },
    { label: t('berries.smoothness'), value: num(berry.smoothness) },
    { label: t('berries.soilDryness'), value: num(berry.soilDryness) },
    { label: t('berries.firmness'), value: berry.firmness ? labels.taxonomy('berry-firmness', berry.firmness) : '–' },
    { label: t('berries.giftPower'), value: num(berry.naturalGiftPower) },
  ]
})
</script>

<template>
  <article class="space-y-6">
    <NuxtLinkLocale to="/items" class="btn btn-ghost w-fit !px-4">
      <AppIcon name="arrow-left" :size="18" />
      {{ t('items.listTitle') }}
    </NuxtLinkLocale>

    <EntityHeader :names="item.names" :kicker="t('items.kicker')">
      <img :src="sprites.item(item.slug)" :alt="name(item.names)" width="64" height="64" class="h-16 w-16 [image-rendering:pixelated]">
      <span class="chip !cursor-default">{{ labels.taxonomy('item-category', item.category) }}</span>
      <span v-if="item.pocket" class="chip !cursor-default">{{ labels.taxonomy('item-pocket', item.pocket) }}</span>
      <p class="basis-full pt-2 text-lg"><LocalizedText :value="item.shortEffect" /></p>
    </EntityHeader>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="panel p-6">
        <h2 class="mb-4 text-2xl font-bold">{{ t('moves.sections.data') }}</h2>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <div v-for="fact in facts" :key="fact.label">
            <dt class="text-sm text-muted">{{ fact.label }}</dt>
            <dd class="font-semibold">{{ fact.value }}</dd>
          </div>
        </dl>
        <ul v-if="item.attributes.length" class="mt-5 flex flex-wrap gap-2">
          <li v-for="attribute in item.attributes" :key="attribute" class="rounded-full bg-surface-2 px-3 py-1 text-sm">{{ labels.taxonomy('item-attribute', attribute) }}</li>
        </ul>
      </section>

      <section v-if="berryFacts.length" class="panel p-6">
        <h2 class="mb-4 text-2xl font-bold">{{ t('berries.title') }}</h2>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <div v-for="fact in berryFacts" :key="fact.label">
            <dt class="text-sm text-muted">{{ fact.label }}</dt>
            <dd class="font-semibold">{{ fact.value }}</dd>
          </div>
        </dl>
        <div class="mt-5 flex flex-wrap items-center gap-2">
          <TypeBadge v-if="item.berry?.naturalGiftType" :type="item.berry.naturalGiftType" size="sm" link />
          <span v-for="flavor in item.berry?.flavors ?? []" :key="flavor.flavor" class="rounded-full bg-surface-2 px-3 py-1 text-sm">{{ labels.taxonomy('flavor', flavor.flavor) }} {{ flavor.potency }}</span>
        </div>
      </section>
    </div>

    <section v-if="!sameText && (item.effect.en || item.effect.ja)" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('abilities.sections.details') }}</h2>
      <p class="max-w-prose leading-relaxed"><LocalizedText :value="item.effect" /></p>
    </section>

    <section v-if="item.machines.length" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('items.teaches') }}</h2>
      <ul class="flex flex-wrap gap-2">
        <li v-for="machine in item.machines" :key="`${machine.versionGroup}-${machine.move}`" class="chip !cursor-default">
          <NuxtLinkLocale :to="`/moves/${machine.move}`" class="font-semibold">{{ labels.move(machine.move) }}</NuxtLinkLocale>
          <span class="text-muted">{{ labels.taxonomy('version-group', machine.versionGroup) }}</span>
        </li>
      </ul>
    </section>

    <section v-if="item.heldBy.length" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('items.heldBy', { count: item.heldBy.length }) }}</h2>
      <PokemonGrid :ids="item.heldBy.map(entry => entry.id)" :notes="notes" />
    </section>

    <section v-if="item.flavor.length" class="panel p-6">
      <h2 class="mb-4 text-2xl font-bold">{{ t('moves.sections.descriptions') }}</h2>
      <VersionTexts :entries="item.flavor" />
    </section>
  </article>
</template>
