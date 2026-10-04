import { describe, expect, it } from 'vitest'
import { RIVER } from '../src/data/areas'
import { TUNING } from '../src/data/tuning'
import { newGameState } from '../src/state/GameState'
import { placePlayer, stepPlayer } from '../src/systems/movement'

const hw = TUNING.player.halfWidth
const fresh = () => newGameState(0, 1)

describe('stepPlayer', () => {
  it('walks east at walking speed and faces east', () => {
    const s = fresh()
    s.player.facing = -1
    const x0 = s.player.x
    expect(stepPlayer(s, { dx: 1, dy: 0 }, 1)).toBe(true)
    expect(s.player.x).toBeCloseTo(x0 + TUNING.player.walkSpeed)
    expect(s.player.facing).toBe(1)
  })

  it('does nothing with no input', () => {
    const s = fresh()
    const before = structuredClone(s.player)
    expect(stepPlayer(s, { dx: 0, dy: 0 }, 1)).toBe(false)
    expect(s.player).toEqual(before)
  })

  it('keeps the feet inside the walkable strip', () => {
    const s = fresh()
    stepPlayer(s, { dx: 0, dy: -1 }, 100)
    expect(s.player.y).toBe(TUNING.world.walkTop)
    stepPlayer(s, { dx: 0, dy: 1 }, 100)
    expect(s.player.y).toBe(TUNING.world.walkBottom)
  })

  it('stops at both ends of the world', () => {
    const s = fresh()
    s.player.x = 3
    stepPlayer(s, { dx: -1, dy: 0 }, 10)
    expect(s.player.x).toBe(hw)
    s.player.x = TUNING.world.width - 3
    stepPlayer(s, { dx: 1, dy: 0 }, 10)
    expect(s.player.x).toBe(TUNING.world.width - hw)
  })

  it('cannot cross the river from the west, even in one long step', () => {
    const s = fresh()
    s.player.x = RIVER.x0 - 50
    stepPlayer(s, { dx: 1, dy: 0 }, 60)
    expect(s.player.x).toBe(RIVER.x0 - hw)
  })

  it('cannot cross the river from the east', () => {
    const s = fresh()
    s.player.x = RIVER.x1 + 50
    stepPlayer(s, { dx: -1, dy: 0 }, 60)
    expect(s.player.x).toBe(RIVER.x1 + hw)
  })
})

describe('placePlayer', () => {
  it('moves a player dropped in the river to the nearer bank', () => {
    const s = fresh()
    placePlayer(s, RIVER.x0 + 5)
    expect(s.player.x).toBe(RIVER.x0 - hw)
    placePlayer(s, RIVER.x1 - 5)
    expect(s.player.x).toBe(RIVER.x1 + hw)
  })
})
