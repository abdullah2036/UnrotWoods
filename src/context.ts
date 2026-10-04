import type { AuroraStrength } from './data/sky'
import type { Clock } from './state/clock'
import type { Store } from './state/store'
import type { Input } from './systems/input'

/** The pieces every part of the game shares. */
export interface GameContext {
  store: Store
  clock: Clock
  input: Input
  /** dev panel settings; never saved */
  dev: { auroraOverride: AuroraStrength | null }
}
