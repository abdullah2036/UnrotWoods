/**
 * Keyboard only. Keys typed into a text field never reach the game,
 * and walking pauses while a menu is open.
 */
import type { MoveInput } from './movement'

const WEST = ['KeyA', 'ArrowLeft']
const EAST = ['KeyD', 'ArrowRight']
const NORTH = ['KeyW', 'ArrowUp']
const SOUTH = ['KeyS', 'ArrowDown']
const GAME_KEYS = new Set([...WEST, ...EAST, ...NORTH, ...SOUTH, 'KeyE', 'Space'])

export class Input {
  private held = new Set<string>()
  private handlers = new Map<string, () => void>()
  /** true while a menu covers the game */
  paused = false

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (isTyping(e.target) && e.code !== 'Escape') return
      const handler = this.handlers.get(e.code) ?? this.handlers.get(e.key)
      if (handler && !e.repeat) {
        e.preventDefault()
        handler()
        return
      }
      if (GAME_KEYS.has(e.code)) {
        e.preventDefault()
        this.held.add(e.code)
      }
    })
    window.addEventListener('keyup', (e) => this.held.delete(e.code))
    window.addEventListener('blur', () => this.held.clear())
  }

  /** Calls fn when any of these keys is pressed, even while a menu is open. Matches KeyboardEvent code or key. */
  on(keys: string[], fn: () => void) {
    for (const k of keys) this.handlers.set(k, fn)
  }

  move(): MoveInput {
    if (this.paused) return { dx: 0, dy: 0 }
    const any = (keys: string[]) => keys.some((k) => this.held.has(k))
    return {
      dx: (any(EAST) ? 1 : 0) - (any(WEST) ? 1 : 0),
      dy: (any(SOUTH) ? 1 : 0) - (any(NORTH) ? 1 : 0),
    }
  }
}

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
}
