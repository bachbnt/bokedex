<script setup lang="ts">
import type { SearchKind } from '~/composables/useSearchIndex'

const RESULT_LIMIT = 30

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const { name, altName } = useL10n()
const sprites = useSprites()
const { load, search, loading, ready } = useSearchIndex()

const open = useState('search:open', () => false)
const dialog = ref<HTMLDialogElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const query = ref('')
const kind = ref<SearchKind | null>(null)
const active = ref(0)

const hits = computed(() => search(query.value, kind.value, RESULT_LIMIT))

const hrefOf = (hitKind: string, slug: string) => localePath(`${SEARCH_ROUTES[hitKind as SearchKind]}${slug}`)

watch(open, async (isOpen) => {
  if (!dialog.value) return
  if (isOpen && !dialog.value.open) {
    query.value = ''
    kind.value = null
    active.value = 0
    dialog.value.showModal()
    load()
    await nextTick()
    input.value?.focus()
  }
  else if (!isOpen && dialog.value.open) {
    dialog.value.close()
  }
})
watch(hits, () => { active.value = 0 })

function go(index: number) {
  const hit = hits.value[index]
  if (!hit) return
  open.value = false
  router.push(hrefOf(hit.row.k, hit.row.s))
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') { event.preventDefault(); active.value = Math.min(active.value + 1, hits.value.length - 1) }
  else if (event.key === 'ArrowUp') { event.preventDefault(); active.value = Math.max(active.value - 1, 0) }
  else if (event.key === 'Enter') { event.preventDefault(); go(active.value) }
}

onKeyStroke('k', (event) => {
  if (!(event.metaKey || event.ctrlKey)) return
  event.preventDefault()
  open.value = !open.value
})

const onBackdrop = (event: MouseEvent) => { if (event.target === dialog.value) open.value = false }
const spriteOf = (slug: string) => sprites.pixel(Number(slug.split('/')[0]))
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto mt-[10vh] w-[min(40rem,calc(100%-1.5rem))] rounded-[28px] border border-line bg-surface p-0 text-ink shadow-card backdrop:bg-[#0b0e26]/60 backdrop:backdrop-blur-sm"
    :aria-label="t('search.open')"
    @close="open = false"
    @click="onBackdrop"
  >
    <div class="flex max-h-[75dvh] flex-col">
      <div class="flex items-center gap-3 border-b border-line p-4">
        <label class="relative block flex-1">
          <span class="sr-only">{{ t('search.open') }}</span>
          <AppIcon name="search" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            ref="input"
            v-model="query"
            type="search"
            class="input !pl-12"
            :placeholder="t('search.placeholder')"
            autocomplete="off"
            @keydown="onKey"
          >
        </label>
        <button type="button" class="grid h-11 w-11 place-items-center rounded-full border border-line" :aria-label="t('common.close')" @click="open = false">
          <AppIcon name="x" />
        </button>
      </div>

      <div class="flex gap-2 overflow-x-auto px-4 py-3" role="group" :aria-label="t('search.filterKind')">
        <button type="button" class="chip shrink-0" :aria-pressed="kind === null" @click="kind = null">{{ t('search.kind.all') }}</button>
        <button v-for="option in SEARCH_KINDS" :key="option" type="button" class="chip shrink-0" :aria-pressed="kind === option" @click="kind = option">
          {{ t(`search.kind.${option}`) }}
        </button>
      </div>

      <ul class="flex-1 overflow-y-auto px-2 pb-3" role="listbox" :aria-label="t('search.results')">
        <li v-for="(hit, index) in hits" :key="`${hit.row.k}:${hit.row.s}`" role="option" :aria-selected="index === active">
          <NuxtLink
            :to="hrefOf(hit.row.k, hit.row.s)"
            class="flex items-center gap-3 rounded-2xl px-3 py-2"
            :class="index === active ? 'bg-surface-2' : ''"
            @click="open = false"
            @mouseenter="active = index"
          >
            <img v-if="hit.row.k === 'pokemon'" :src="spriteOf(hit.row.s)" alt="" width="40" height="40" class="h-10 w-10 shrink-0 object-contain [image-rendering:pixelated]">
            <span v-else class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted">
              <AppIcon :name="hit.row.k === 'move' ? 'bolt' : hit.row.k === 'ability' ? 'sparkle' : hit.row.k === 'item' ? 'bag' : hit.row.k === 'location' ? 'map' : hit.row.k === 'type' ? 'shield' : 'leaf'" :size="18" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold">{{ name(hit.row.names) }}</span>
              <span v-if="altName(hit.row.names)" class="block truncate text-sm text-muted">{{ altName(hit.row.names) }}</span>
            </span>
            <span class="shrink-0 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted">{{ t(`search.kind.${hit.row.k}`) }}</span>
          </NuxtLink>
        </li>
        <li v-if="loading && !ready" class="py-8 text-center text-muted">{{ t('common.loading') }}</li>
        <li v-else-if="query.trim() && !hits.length" class="py-8 text-center text-muted">{{ t('search.empty') }}</li>
        <li v-else-if="!query.trim()" class="py-8 text-center text-muted">{{ t('search.hint') }}</li>
      </ul>
    </div>
  </dialog>
</template>
