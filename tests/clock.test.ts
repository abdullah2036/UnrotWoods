import { describe, expect, it } from 'vitest'
import { Clock } from '../src/state/clock'
import { newGameState } from '../src/state/GameState'

function setup() {
  let real = 1_000_000
  const state = newGameState(real, 1)
  const clock = new Clock(() => state, () => real)
  return { state, clock, advance: (ms: number) => (real += ms), real: () => real }
}

describe('Clock', () => {
  it('matches real time at x1', () => {
    const t = setup()
    t.advance(5000)
    expect(t.clock.now()).toBe(t.real())
  })

  it('runs faster under a multiplier', () => {
    const t = setup()
    t.clock.setMultiplier(60)
    t.advance(1000)
    expect(t.clock.now() - t.real()).toBe(59_000)
  })

  it('keeps gained time when the multiplier goes back to x1', () => {
    const t = setup()
    t.clock.setMultiplier(10)
    t.advance(1000)
    t.clock.setMultiplier(1)
    t.advance(1000)
    expect(t.clock.now() - t.real()).toBe(9000)
  })

  it('folds gained time into the state so a reload keeps it', () => {
    const t = setup()
    t.clock.setMultiplier(60)
    t.advance(2000)
    t.clock.fold()
    expect(t.state.clock.offsetMs).toBe(118_000)
    // a new Clock built from the saved state shows the same game time
    const reloaded = new Clock(() => structuredClone(t.state), t.real)
    expect(reloaded.now()).toBe(t.clock.now())
  })

  it('never runs backwards across a fold', () => {
    const t = setup()
    t.clock.setMultiplier(60)
    t.advance(500)
    const before = t.clock.now()
    t.clock.fold()
    expect(t.clock.now()).toBe(before)
  })
})
