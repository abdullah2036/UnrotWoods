import type { Input } from '../systems/input'

/** One menu open at a time. While it is open the player does not walk. */
export class Menus {
  private current: HTMLElement | null = null

  constructor(
    private root: HTMLElement,
    private input: Input,
  ) {}

  get isOpen() {
    return this.current !== null
  }

  open(panel: HTMLElement) {
    this.close()
    this.current = panel
    this.root.append(panel)
    this.input.paused = true
  }

  close() {
    this.current?.remove()
    this.current = null
    this.input.paused = false
  }
}
