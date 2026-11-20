import type { EvolutionDetail } from '#shared/types/encyclopedia'

/** Turns the structured ways a Pokémon evolves into short phrases in the current language. */
export function useEvolutionText() {
  const { t } = useI18n()
  const labels = useLabels()

  function phrase(detail: EvolutionDetail): string {
    const parts: string[] = []

    if (detail.trigger === 'level-up') {
      parts.push(detail.minLevel ? t('evolution.level', { level: detail.minLevel }) : t('evolution.levelUp'))
    }
    else if (detail.trigger === 'trade') parts.push(t('evolution.trade'))
    else if (detail.trigger === 'use-item' && detail.item) parts.push(labels.item(detail.item))
    else parts.push(labels.taxonomy('evolution-trigger', detail.trigger))

    if (detail.item && detail.trigger !== 'use-item') parts.push(labels.item(detail.item))
    if (detail.heldItem) parts.push(t('evolution.holding', { item: labels.item(detail.heldItem) }))
    if (detail.knownMove) parts.push(t('evolution.knowing', { move: labels.move(detail.knownMove) }))
    if (detail.knownMoveType) parts.push(t('evolution.knowingType', { type: labels.type(detail.knownMoveType) }))
    if (detail.minHappiness) parts.push(t('evolution.friendship'))
    if (detail.minAffection) parts.push(t('evolution.affection'))
    if (detail.minBeauty) parts.push(t('evolution.beauty'))
    if (detail.timeOfDay) parts.push(labels.taxonomy('time-of-day', detail.timeOfDay))
    if (detail.location) parts.push(t('evolution.at', { place: labels.location(detail.location) }))
    if (detail.gender) parts.push(t(`evolution.${detail.gender}`))
    if (detail.needsOverworldRain) parts.push(t('evolution.rain'))
    if (detail.partySpecies) parts.push(t('evolution.party', { name: titleCase(detail.partySpecies) }))
    if (detail.partyType) parts.push(t('evolution.partyType', { type: labels.type(detail.partyType) }))
    if (detail.relativePhysicalStats !== null) parts.push(t(`evolution.stats.${detail.relativePhysicalStats}`))
    if (detail.tradeSpecies) parts.push(t('evolution.tradeFor', { name: titleCase(detail.tradeSpecies) }))
    if (detail.turnUpsideDown) parts.push(t('evolution.upsideDown'))

    return parts.join(t('common.listSeparator'))
  }

  return { describe: (details: EvolutionDetail[]) => details.map(phrase) }
}
