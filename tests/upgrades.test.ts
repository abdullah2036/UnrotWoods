import { describe, expect, it } from 'vitest'
import { newGameState, SAVE_VERSION } from '../src/state/GameState'
import { SaveError, upgradeSave } from '../src/state/upgrades'

describe('upgradeSave', () => {
  it('accepts a current save unchanged', () => {
    const s = newGameState(123, 5)
    expect(upgradeSave(structuredClone(s))).toEqual(s)
  })

  it('does not change the object it was given', () => {
    const s = newGameState(123, 5)
    const copy = structuredClone(s)
    upgradeSave(s)
    expect(s).toEqual(copy)
  })

  it('runs every upgrade step in order up to the current version', () => {
    const upgrades = {
      1: (s: Record<string, unknown>) => ({ ...s, cat: 0 }),
      2: (s: Record<string, unknown>) => ({ ...s, cat: (s.cat as number) + 1 }),
    }
    const out = upgradeSave({ saveVersion: 1 }, upgrades, 3) as unknown as Record<string, unknown>
    expect(out).toEqual({ saveVersion: 3, cat: 1 })
  })

  it('refuses a save with a missing upgrade step', () => {
    expect(() => upgradeSave({ saveVersion: 1 }, {}, 2)).toThrow(SaveError)
  })

  it('refuses saves from a newer version', () => {
    expect(() => upgradeSave({ ...newGameState(0, 1), saveVersion: SAVE_VERSION + 1 })).toThrow(/newer version/)
  })

  it.each([null, 'hello', 42, [], {}, { saveVersion: 'one' }, { saveVersion: 0 }])('refuses %j', (raw) => {
    expect(() => upgradeSave(raw)).toThrow(SaveError)
  })

  it('refuses a damaged save', () => {
    const s = newGameState(0, 1) as unknown as { player: unknown }
    s.player = { x: 'far away' }
    expect(() => upgradeSave(s)).toThrow(/damaged/)
  })
})
