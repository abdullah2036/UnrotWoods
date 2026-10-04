import { SAVE_VERSION, type GameState } from './GameState'

type RawSave = Record<string, unknown>

/**
 * UPGRADES[n] turns a version n save into a version n+1 save.
 * Saves are always upgraded, never thrown away.
 */
export const UPGRADES: Record<number, (save: RawSave) => RawSave> = {}

export class SaveError extends Error {}

/** Takes anything read from storage or a file and returns a current GameState, or throws SaveError. */
export function upgradeSave(raw: unknown, upgrades = UPGRADES, current = SAVE_VERSION): GameState {
  if (!isObject(raw)) throw new SaveError('This is not an Unrot save.')
  let save: RawSave = structuredClone(raw)
  let version = save.saveVersion
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1)
    throw new SaveError('This is not an Unrot save.')
  if (version > current) throw new SaveError(`This save is from a newer version of Unrot (save version ${version}).`)
  while (version < current) {
    const step = upgrades[version]
    if (!step) throw new SaveError(`No upgrade from save version ${version}.`)
    save = step(save)
    version += 1
    save.saveVersion = version
  }
  if (current === SAVE_VERSION) checkShape(save)
  return save as unknown as GameState
}

function checkShape(s: RawSave) {
  const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v)
  const ok =
    num(s.createdAt) &&
    num(s.savedAt) &&
    num(s.seed) &&
    isObject(s.clock) && num(s.clock.offsetMs) &&
    isObject(s.sky) && num(s.sky.epochMs) &&
    isObject(s.player) && num(s.player.x) && num(s.player.y) && (s.player.facing === 1 || s.player.facing === -1) &&
    isObject(s.materials) && num(s.materials.wood) && num(s.materials.stone)
  if (!ok) throw new SaveError('This save is damaged and cannot be loaded.')
}

function isObject(v: unknown): v is RawSave {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
