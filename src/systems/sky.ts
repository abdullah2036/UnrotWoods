/**
 * The sky is a pure function of game time and the save's seed,
 * so reopening the game always shows the sky it should have now.
 */
import { SKY, type AuroraStrength, type SkyPhaseId } from '../data/sky'
import type { GameState } from '../state/GameState'

export interface SkyNow {
  /** which cycle this is, counting from the save's first dusk */
  night: number
  /** 0..1 through the whole cycle */
  cycleT: number
  phase: SkyPhaseId
  /** 0..1 through the current phase */
  phaseT: number
  aurora: AuroraStrength
  snow: boolean
}

const CYCLE_MS = SKY.cycleMinutes * 60_000

export function skyAt(state: GameState, gameNow: number, auroraOverride: AuroraStrength | null = null): SkyNow {
  const elapsed = gameNow - state.sky.epochMs
  const night = Math.floor(elapsed / CYCLE_MS)
  const cycleT = (elapsed - night * CYCLE_MS) / CYCLE_MS

  let phase = SKY.phases[SKY.phases.length - 1]
  let start = 0
  for (const p of SKY.phases) {
    if (cycleT < start + p.share) {
      phase = p
      break
    }
    start += p.share
  }
  const phaseT = Math.min(1, (cycleT - start) / phase.share)

  const rolled = rollNight(state.seed, night)
  const aurora = auroraOverride ?? rolled.aurora
  const snow = aurora === 'faint' || aurora === 'ribbon' ? rolled.snow : false
  return { night, cycleT, phase: phase.id, phaseT, aurora, snow }
}

export function rollNight(seed: number, night: number): { aurora: AuroraStrength; snow: boolean } {
  const a = hash(seed, night, 1)
  let acc = 0
  let aurora = SKY.aurora[SKY.aurora.length - 1].id
  for (const s of SKY.aurora) {
    acc += s.weight
    if (a < acc) {
      aurora = s.id
      break
    }
  }
  return { aurora, snow: hash(seed, night, 2) < SKY.snowChance }
}

/** Deterministic hash of three integers to [0, 1). */
function hash(a: number, b: number, c: number): number {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 1442695041)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296
}
