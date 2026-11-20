<script setup lang="ts">
const RESULT_LIMIT = 60

const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ select: [id: number] }>()

const props = defineProps<{ disabledIds: number[] }>()

const { pokemon } = useDex()
const sprites = useSprites()

const dialog = ref<HTMLDialogElement | null>(null)
const search = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

const results = computed(() =>
  pokemon.value.filter(entry => matchesQuery(entry, search.value)).slice(0, RESULT_LIMIT),
)

watch(open, async (isOpen) => {
  if (!dialog.value) return
  if (isOpen && !dialog.value.open) {
    search.value = ''
    dialog.value.showModal()
    await nextTick()
    searchInput.value?.focus()
  }
  else if (!isOpen && dialog.value.open) {
    dialog.value.close()
  }
})

function pick(id: number) {
  emit('select', id)
  open.value = false
}

/** Clicking the dimmed backdrop (the dialog element itself) closes it. */
function onBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value) open.value = false
}
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto w-[min(40rem,calc(100%-1.5rem))] rounded-[28px] border border-line bg-surface p-0 text-ink shadow-card backdrop:bg-[#0b0e26]/60 backdrop:backdrop-blur-sm"
    aria-label="Choose a Pokémon"
    @close="open = false"
    @click="onBackdropClick"
  >
    <div class="flex max-h-[80dvh] flex-col">
      <div class="flex items-center gap-3 border-b border-line p-4">
        <label class="relative block flex-1">
          <span class="sr-only">Search Pokémon</span>
          <AppIcon name="search" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input ref="searchInput" v-model="search" type="search" class="input !pl-12" placeholder="Search by name or number" autocomplete="off">
        </label>
        <button type="button" class="grid h-11 w-11 place-items-center rounded-full border border-line" aria-label="Close" @click="open = false">
          <AppIcon name="x" />
        </button>
      </div>

      <ul class="grid flex-1 grid-cols-2 gap-2 overflow-y-auto p-4 sm:grid-cols-3">
        <li v-for="entry in results" :key="entry.id">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-2xl border border-line bg-surface-2 p-2 text-left transition-all enabled:hover:-translate-y-0.5 enabled:hover:border-muted disabled:opacity-40"
            :disabled="props.disabledIds.includes(entry.id)"
            @click="pick(entry.id)"
          >
            <img :src="sprites.pixel(entry.id)" :alt="''" width="48" height="48" loading="lazy" class="h-12 w-12 shrink-0 object-contain [image-rendering:pixelated]">
            <span class="min-w-0">
              <span class="block truncate text-sm font-semibold">{{ titleCase(entry.name) }}</span>
              <span class="block text-xs text-muted">{{ padDexId(entry.id) }}</span>
            </span>
          </button>
        </li>
        <li v-if="!results.length" class="col-span-full py-8 text-center text-muted">No Pokémon match that search.</li>
      </ul>
    </div>
  </dialog>
</template>
