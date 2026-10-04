import { AREAS, RIVER, type AreaDef } from '../data/areas'
import { TUNING } from '../data/tuning'
import type { GameState } from '../state/GameState'

const { world, player } = TUNING

export function areaAt(x: number): AreaDef {
  return AREAS.find((a) => x < a.x1) ?? AREAS[AREAS.length - 1]
}

/** Ground nobody can stand on, as [x0, x1] ranges. The bridge will open the river. */
export function blockedRanges(_state: GameState): [number, number][] {
  return [[RIVER.x0, RIVER.x1]]
}

/**
 * Moves from fromX towards toX and returns where the player ends up:
 * inside the world and never inside or across blocked ground.
 */
export function constrainX(state: GameState, fromX: number, toX: number): number {
  const hw = player.halfWidth
  let x = Math.max(hw, Math.min(world.width - hw, toX))
  for (const [b0, b1] of blockedRanges(state)) {
    const lo = b0 - hw
    const hi = b1 + hw
    if (fromX <= lo && x > lo) x = lo
    else if (fromX >= hi && x < hi) x = hi
    else if (x > lo && x < hi) x = x - lo < hi - x ? lo : hi
  }
  return x
}

export function constrainY(y: number): number {
  return Math.max(world.walkTop, Math.min(world.walkBottom, y))
}
