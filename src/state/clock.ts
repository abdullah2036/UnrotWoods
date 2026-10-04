import type { GameState } from './GameState'

/**
 * Game time. It equals real clock time until the dev panel speeds it up;
 * the extra time is kept in state.clock.offsetMs so it survives a reload.
 * Timers always read this clock, never count frames.
 */
export class Clock {
  multiplier = 1
  private anchorReal: number

  constructor(
    private getState: () => GameState,
    private realNow: () => number = Date.now,
  ) {
    this.anchorReal = this.realNow()
  }

  now(): number {
    const real = this.realNow()
    return real + this.getState().clock.offsetMs + (real - this.anchorReal) * (this.multiplier - 1)
  }

  setMultiplier(m: number) {
    this.fold()
    this.multiplier = m
  }

  /** Moves time gained from the multiplier into the state, so a save holds it. */
  fold() {
    const real = this.realNow()
    this.getState().clock.offsetMs += (real - this.anchorReal) * (this.multiplier - 1)
    this.anchorReal = real
  }

  /** Call after the state object is swapped out (import, reset). */
  restart() {
    this.anchorReal = this.realNow()
  }
}
