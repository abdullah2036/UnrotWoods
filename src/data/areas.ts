/** The five areas of Unrot Woods, west to east. x ranges are world pixels. */
export interface AreaDef {
  id: AreaId
  name: string
  x0: number
  x1: number
}

export type AreaId = 'lake' | 'clearing' | 'woods' | 'river' | 'overlook'

export const AREAS: AreaDef[] = [
  { id: 'lake', name: 'Lake and dock', x0: 0, x1: 720 },
  { id: 'clearing', name: 'Cabin clearing', x0: 720, x1: 1440 },
  { id: 'woods', name: 'Pine woods', x0: 1440, x1: 2400 },
  { id: 'river', name: 'River', x0: 2400, x1: 2880 },
  { id: 'overlook', name: 'Overlook', x0: 2880, x1: 3840 },
]

/** The river water. Nobody can cross it until the bridge is built. */
export const RIVER = { x0: 2600, x1: 2680 }

/** Where the dev panel drops the player in each area. */
export const AREA_SPAWNS: Record<AreaId, number> = {
  lake: 360,
  clearing: 1080,
  woods: 1900,
  river: 2520,
  overlook: 3300,
}
