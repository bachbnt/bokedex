<script setup lang="ts">
import type { AbilityRow, PokemonRow } from '#shared/types/encyclopedia'
import { defaultBuild, evTotal, normalizeBuild, withEv } from '~/utils/team-build'
import type { TeamBuild } from '~/utils/team-build'

const props = defineProps<{ pokemon: PokemonRow | null, build: TeamBuild }>()
// `flush: 'post'` below: the props for the member being edited must be in place before the draft is copied.
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ save: [build: TeamBuild] }>()

const { t } = useI18n()
const { name, altName, locale } = useL10n()
const { refs } = useTaxonomyRefs()
const labels = useLabels(refs)
const sprites = useSprites()
const { types } = useTypeChart()
const { reference } = useReference()
const { data: abilityRows } = useDataset<AbilityRow[]>('abilities')

const dialog = ref<HTMLDialogElement | null>(null)
const draft = ref<TeamBuild>(defaultBuild())

const natures = computed(() => (reference.value?.natures ?? []).toSorted((a, b) => name(a.names).localeCompare(name(b.names), locale.value)))
const nature = computed(() => natures.value.find(entry => entry.slug === draft.value.nature))
const abilityName = (slug: string) => {
  const row = abilityRows.value?.find(entry => entry.slug === slug)
  return row ? name(row.names) : titleCase(slug)
}

const stats = computed(() => {
  const row = props.pokemon
  return row ? buildStats(row.stats, draft.value, nature.value, row.slug === 'shedinja') : []
})
const total = computed(() => evTotal(draft.value))

watch(open, (isOpen) => {
  if (!dialog.value) return
  if (isOpen && !dialog.value.open) {
    draft.value = normalizeBuild(structuredClone(toRaw(props.build)))
    dialog.value.showModal()
  }
  else if (!isOpen && dialog.value.open) {
    dialog.value.close()
  }
}, { flush: 'post' })

const setIv = (stat: StatKey, raw: number) => { draft.value = normalizeBuild({ ...draft.value, ivs: { ...draft.value.ivs, [stat]: raw } }) }
const setEv = (stat: StatKey, raw: number) => { draft.value = withEv(draft.value, stat, raw) }
const setLevel = (raw: number) => { draft.value = normalizeBuild({ ...draft.value, level: raw }) }
const reset = () => { draft.value = defaultBuild() }

function save() {
  emit('save', draft.value)
  open.value = false
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value) open.value = false
}
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto w-[min(44rem,calc(100%-1.5rem))] rounded-[28px] border border-line bg-surface p-0 text-ink shadow-card backdrop:bg-[#0b0e26]/60 backdrop:backdrop-blur-sm"
    :aria-label="t('team.build.title')"
    @close="open = false"
    @click="onBackdropClick"
  >
    <div v-if="pokemon" class="flex max-h-[88dvh] flex-col" :style="pokemonTheme(pokemon.types)">
      <div class="flex items-center gap-4 border-b border-line p-4">
        <img :src="sprites.artwork(pokemon.id)" :alt="name(pokemon.names)" width="64" height="64" class="h-16 w-16 object-contain">
        <div class="min-w-0 flex-1">
          <h2 class="truncate font-display text-2xl font-bold">{{ name(pokemon.names) }}</h2>
          <p class="text-sm text-muted">{{ altName(pokemon.names) }}</p>
        </div>
        <button type="button" class="grid h-11 w-11 place-items-center rounded-full border border-line" :aria-label="t('common.close')" @click="open = false">
          <AppIcon name="x" />
        </button>
      </div>

      <div class="space-y-6 overflow-y-auto p-5">
        <fieldset>
          <legend class="mb-2 text-sm font-semibold text-muted">{{ t('team.build.tera') }}</legend>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="chip" :aria-pressed="draft.tera === null" @click="draft.tera = null">{{ t('team.build.noTera') }}</button>
            <button v-for="type in types" :key="type" type="button" class="chip" :aria-pressed="draft.tera === type" @click="draft.tera = type">
              <TypeBadge :type="type" size="sm" />
            </button>
          </div>
          <p class="mt-2 text-sm text-muted">{{ t('team.build.teraHint') }}</p>
        </fieldset>

        <div class="grid gap-4 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_6rem]">
          <label>
            <span class="mb-1 block text-sm text-muted">{{ t('natures.nature') }}</span>
            <select v-model="draft.nature" class="input cursor-pointer">
              <option :value="null">{{ t('team.build.noNature') }}</option>
              <option v-for="entry in natures" :key="entry.slug" :value="entry.slug">
                {{ name(entry.names) }}{{ entry.increasedStat ? ` (+${labels.taxonomy('stat', entry.increasedStat)} −${labels.taxonomy('stat', entry.decreasedStat)})` : '' }}
              </option>
            </select>
          </label>
          <label>
            <span class="mb-1 block text-sm text-muted">{{ t('team.build.ability') }}</span>
            <select v-model="draft.ability" class="input cursor-pointer">
              <option :value="null">{{ t('team.build.noAbility') }}</option>
              <option v-for="slug in pokemon.abilities" :key="slug" :value="slug">{{ abilityName(slug) }}</option>
            </select>
          </label>
          <label>
            <span class="mb-1 block text-sm text-muted">{{ t('calc.level') }}</span>
            <input :value="draft.level" type="number" min="1" max="100" class="input" @input="setLevel(($event.target as HTMLInputElement).valueAsNumber)">
          </label>
        </div>

        <div>
          <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 class="text-sm font-semibold text-muted">{{ t('team.build.stats') }}</h3>
            <p class="text-sm" :class="total >= MAX_TOTAL_EV ? 'text-bad' : 'text-muted'">{{ t('calc.evTotal', { total, max: MAX_TOTAL_EV }) }}</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[26rem] text-left text-sm">
              <thead class="text-muted">
                <tr class="border-b border-line">
                  <th class="py-2 pr-3 font-medium">{{ t('calc.stat') }}</th>
                  <th class="py-2 pr-3 text-right font-medium">{{ t('calc.base') }}</th>
                  <th class="py-2 pr-3 font-medium">IV</th>
                  <th class="py-2 pr-3 font-medium">EV</th>
                  <th class="py-2 text-right font-medium">{{ t('calc.result') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(stat, index) in STAT_KEYS" :key="stat" class="border-b border-line/60 last:border-0">
                  <th scope="row" class="py-2 pr-3 text-left font-medium">
                    {{ labels.taxonomy('stat', stat) }}
                    <span v-if="nature?.increasedStat === stat && nature.increasedStat !== nature.decreasedStat" class="text-good">▲</span>
                    <span v-else-if="nature?.decreasedStat === stat && nature.increasedStat !== nature.decreasedStat" class="text-bad">▼</span>
                  </th>
                  <td class="py-2 pr-3 text-right tabular-nums text-muted">{{ pokemon.stats[index] }}</td>
                  <td class="py-2 pr-3"><input :value="draft.ivs[stat]" type="number" min="0" :max="MAX_IV" class="input !w-20 !py-1.5" :aria-label="`IV ${labels.taxonomy('stat', stat)}`" @input="setIv(stat, ($event.target as HTMLInputElement).valueAsNumber)"></td>
                  <td class="py-2 pr-3"><input :value="draft.evs[stat]" type="number" min="0" :max="MAX_EV" step="4" class="input !w-24 !py-1.5" :aria-label="`EV ${labels.taxonomy('stat', stat)}`" @input="setEv(stat, ($event.target as HTMLInputElement).valueAsNumber)"></td>
                  <td class="py-2 text-right font-display text-xl font-extrabold tabular-nums">{{ stats[index] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap justify-between gap-3 border-t border-line p-4">
        <button type="button" class="btn btn-ghost" @click="reset">{{ t('team.build.reset') }}</button>
        <button type="button" class="btn btn-brand" @click="save">{{ t('team.build.save') }}</button>
      </div>
    </div>
  </dialog>
</template>
