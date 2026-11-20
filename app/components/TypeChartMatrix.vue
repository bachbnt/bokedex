<script setup lang="ts">
const { types, effectiveness, status } = useTypeChart()

const hoverAttacker = ref<string | null>(null)
const hoverDefender = ref<string | null>(null)

const CELL_STYLES: Record<number, string> = {
  2: 'bg-good/25 text-good font-bold',
  0.5: 'bg-bad/15 text-bad font-bold',
  0: 'bg-ink text-bg font-bold',
}

const abbreviate = (name: string) => titleCase(name).slice(0, 3)

function clear() {
  hoverAttacker.value = null
  hoverDefender.value = null
}
</script>

<template>
  <div>
    <div v-if="status === 'pending'" class="skeleton h-96" />
    <div v-else class="panel overflow-x-auto p-3">
      <table class="border-separate border-spacing-0.5 text-center text-xs sm:text-sm" @mouseleave="clear">
        <caption class="sr-only">Damage multiplier of each attacking type (rows) against each defending type (columns)</caption>
        <thead>
          <tr>
            <th scope="col" class="sticky left-0 z-10 bg-surface p-1 text-left text-xs font-medium text-muted">Attack ↓ Defend →</th>
            <th v-for="defender in types" :key="defender" scope="col" class="p-0.5">
              <span
                class="block w-9 rounded-lg py-1.5 text-[0.7rem] font-bold sm:w-10"
                :class="hoverDefender === defender ? 'ring-2 ring-ink' : ''"
                :style="{ backgroundColor: typeColor(defender), color: readableInk(typeColor(defender)) }"
                :title="titleCase(defender)"
              >
                {{ abbreviate(defender) }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="attacker in types" :key="attacker">
            <th scope="row" class="sticky left-0 z-10 bg-surface p-0.5 text-left">
              <span
                class="block rounded-lg px-2.5 py-1.5 text-xs font-bold"
                :class="hoverAttacker === attacker ? 'ring-2 ring-ink' : ''"
                :style="{ backgroundColor: typeColor(attacker), color: readableInk(typeColor(attacker)) }"
              >
                {{ titleCase(attacker) }}
              </span>
            </th>
            <td
              v-for="defender in types"
              :key="defender"
              class="h-9 rounded-lg transition-colors sm:h-10"
              :class="[
                CELL_STYLES[effectiveness(attacker, [defender])] ?? 'text-muted/40',
                hoverAttacker === attacker || hoverDefender === defender ? 'brightness-110 outline outline-1 outline-line' : '',
              ]"
              :title="`${titleCase(attacker)} → ${titleCase(defender)}: ${formatMultiplier(effectiveness(attacker, [defender]))}×`"
              @mouseenter="hoverAttacker = attacker; hoverDefender = defender"
            >
              {{ effectiveness(attacker, [defender]) === 1 ? '' : formatMultiplier(effectiveness(attacker, [defender])) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ul class="mt-4 flex flex-wrap gap-4 text-sm text-muted">
      <li class="flex items-center gap-2"><span class="grid h-6 w-6 place-items-center rounded-md bg-good/25 font-bold text-good">2×</span> Super effective</li>
      <li class="flex items-center gap-2"><span class="grid h-6 w-6 place-items-center rounded-md bg-bad/15 font-bold text-bad">½</span> Not very effective</li>
      <li class="flex items-center gap-2"><span class="grid h-6 w-6 place-items-center rounded-md bg-ink font-bold text-bg">0</span> No effect</li>
    </ul>
  </div>
</template>
