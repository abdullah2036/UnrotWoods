import { describe, expect, it } from 'vitest'
import { SKY } from '../src/data/sky'
import { newGameState } from '../src/state/GameState'
import { rollNight, skyAt } from '../src/systems/sky'

const MIN = 60_000
const CYCLE = SKY.cycleMinutes * MIN

describe('skyAt', () => {
  const s = newGameState(0, 42)

  it('starts a new save at dusk', () => {
    expect(skyAt(s, 0).phase).toBe('dusk')
  })

  it('walks through dusk, night, deep night and dawn in one cycle', () => {
    const seen = new Set<string>()
    for (let m = 0; m < SKY.cycleMinutes; m++) seen.add(skyAt(s, m * MIN).phase)
    expect([...seen]).toEqual(['dusk', 'night', 'deepNight', 'dawn'])
    expect(skyAt(s, CYCLE).phase).toBe('dusk')
    expect(skyAt(s, CYCLE).night).toBe(1)
  })

  it('gives the same aurora all night', () => {
    const a = skyAt(s, 3 * CYCLE + 1000).aurora
    expect(skyAt(s, 3 * CYCLE + CYCLE - 1000).aurora).toBe(a)
  })

  it('uses the dev override when set', () => {
    expect(skyAt(s, 0, 'full').aurora).toBe('full')
  })

  it('never snows on a strong aurora night', () => {
    expect(skyAt(s, 0, 'curtains').snow).toBe(false)
    expect(skyAt(s, 0, 'full').snow).toBe(false)
  })
})

describe('rollNight', () => {
  it('is deterministic', () => {
    expect(rollNight(7, 12)).toEqual(rollNight(7, 12))
  })

  it('rolls roughly the planned odds, with full sky about one night in twenty', () => {
    const counts: Record<string, number> = { faint: 0, ribbon: 0, curtains: 0, full: 0 }
    const n = 20_000
    for (let i = 0; i < n; i++) counts[rollNight(99, i).aurora]++
    for (const a of SKY.aurora) expect(counts[a.id] / n).toBeCloseTo(a.weight, 1)
  })
})
