import { TUNING } from '../data/tuning'
import type { GameState } from '../state/GameState'
import { constrainX, constrainY } from '../world/map'

export interface MoveInput {
  /** -1 west, 1 east */
  dx: number
  /** -1 away from the camera, 1 towards it */
  dy: number
}

/** Walks the player for dt seconds. Returns true if they moved. */
export function stepPlayer(state: GameState, input: MoveInput, dt: number): boolean {
  const p = state.player
  if (input.dx === 0 && input.dy === 0) return false
  const len = Math.hypot(input.dx, input.dy)
  const nx = p.x + (input.dx / len) * TUNING.player.walkSpeed * dt
  const ny = p.y + (input.dy / len) * TUNING.player.depthSpeed * dt
  if (input.dx !== 0) p.facing = input.dx > 0 ? 1 : -1
  const x = constrainX(state, p.x, nx)
  const y = constrainY(ny)
  const moved = x !== p.x || y !== p.y
  p.x = x
  p.y = y
  return moved
}

/** Puts the player somewhere directly, such as the dev panel's area jump. */
export function placePlayer(state: GameState, x: number) {
  state.player.x = constrainX(state, x, x)
  state.player.y = constrainY(state.player.y)
}
