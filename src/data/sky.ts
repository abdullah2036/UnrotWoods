/** One sky cycle and the aurora that each night rolls. */
export type SkyPhaseId = 'dusk' | 'night' | 'deepNight' | 'dawn'
export type AuroraStrength = 'faint' | 'ribbon' | 'curtains' | 'full'

export const SKY = {
  cycleMinutes: 48,

  /** phases in order; shares add up to 1 */
  phases: [
    { id: 'dusk', name: 'Dusk', share: 0.2 },
    { id: 'night', name: 'Night', share: 0.3 },
    { id: 'deepNight', name: 'Deep night', share: 0.3 },
    { id: 'dawn', name: 'Blue dawn', share: 0.2 },
  ] as { id: SkyPhaseId; name: string; share: number }[],

  /** chance of each aurora strength on a given night; weights add up to 1 */
  aurora: [
    { id: 'faint', name: 'Faint', weight: 0.4 },
    { id: 'ribbon', name: 'Ribbon', weight: 0.35 },
    { id: 'curtains', name: 'Curtains', weight: 0.2 },
    { id: 'full', name: 'Full sky', weight: 0.05 },
  ] as { id: AuroraStrength; name: string; weight: number }[],

  /** chance of light snow on a faint or ribbon night; strong aurora nights are clear */
  snowChance: 0.35,
}
