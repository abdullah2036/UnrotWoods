import type { GameState } from './GameState'

/**
 * Holds the current GameState and writes it to storage:
 * shortly after every committed change, every autosave interval,
 * and when the page is hidden or closed.
 */
export class Store {
  private pending: ReturnType<typeof setTimeout> | null = null
  private saving: Promise<void> = Promise.resolve()
  private listeners = new Set<() => void>()

  constructor(
    public state: GameState,
    private persist: (state: GameState) => Promise<void>,
    private beforeSave: () => void,
    private debounceMs: number,
  ) {}

  /** Call after any discrete change to the state. */
  commit() {
    this.listeners.forEach((fn) => fn())
    if (this.pending) clearTimeout(this.pending)
    this.pending = setTimeout(() => void this.saveNow(), this.debounceMs)
  }

  /** Swaps in a whole new state (import, reset) and saves it straight away. */
  async replace(state: GameState) {
    this.state = state
    this.listeners.forEach((fn) => fn())
    await this.saveNow()
  }

  saveNow(): Promise<void> {
    if (this.pending) clearTimeout(this.pending)
    this.pending = null
    this.beforeSave()
    const snapshot = this.state
    this.saving = this.saving
      .then(() => this.persist(snapshot))
      .catch((err) => console.warn('Unrot: saving failed.', err))
    return this.saving
  }

  onChange(fn: () => void) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  startAutosave(intervalMs: number) {
    setInterval(() => void this.saveNow(), intervalMs)
    const flush = () => void this.saveNow()
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })
    window.addEventListener('pagehide', flush)
  }
}
