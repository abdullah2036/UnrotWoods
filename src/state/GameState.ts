import { TUNING } from '../data/tuning'

/** Bump this whenever the shape of GameState changes, and add an upgrade in upgrades.ts. */
export const SAVE_VERSION = 1

/**
 * The whole game. Plain and JSON-serialisable: game rules change it,
 * rendering only reads it, and storage writes it as one object.
 */
export interface GameState {
  saveVersion: number
  /** real clock time the save was created */
  createdAt: number
  /** real clock time of the last write to storage */
  savedAt: number
  /** seeds everything rolled from time, such as each night's aurora */
  seed: number
  clock: {
    /** game time minus real time; grows only when the dev panel speeds time up */
    offsetMs: number
  }
  sky: {
    /** game time at which the first dusk began */
    epochMs: number
  }
  player: {
    x: number
    /** y of the player's feet, inside the walkable strip */
    y: number
    facing: 1 | -1
  }
  materials: {
    wood: number
    stone: number
  }
}

export function newGameState(now: number, seed = Math.floor(Math.random() * 2 ** 31)): GameState {
  return {
    saveVersion: SAVE_VERSION,
    createdAt: now,
    savedAt: now,
    seed,
    clock: { offsetMs: 0 },
    sky: { epochMs: now },
    player: { x: TUNING.player.spawnX, y: TUNING.player.spawnY, facing: 1 },
    materials: { wood: 0, stone: 0 },
  }
}
