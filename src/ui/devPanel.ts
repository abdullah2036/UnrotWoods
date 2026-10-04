/**
 * Developer panel, toggled with the backquote key. It does not pause the game,
 * so time and walking can be tested while it is open.
 */
import type { GameContext } from '../context'
import { AREA_SPAWNS, AREAS } from '../data/areas'
import { SKY, type AuroraStrength } from '../data/sky'
import { TUNING } from '../data/tuning'
import { newGameState } from '../state/GameState'
import { placePlayer } from '../systems/movement'
import { skyAt } from '../systems/sky'
import { areaAt } from '../world/map'
import { button, el } from './dom'

export class DevPanel {
  private root: HTMLElement
  private readout = el('pre', { class: 'readout' })
  private timeRow = el('div', { class: 'row' })
  private auroraRow = el('div', { class: 'row' })
  private toggles: [HTMLButtonElement, () => boolean][] = []
  private resetArmed = false
  private resetButton: HTMLButtonElement
  private timer = 0

  constructor(
    private ctx: GameContext,
    parent: HTMLElement,
  ) {
    const { store } = ctx
    const addMaterial = (kind: 'wood' | 'stone') => () => {
      store.state.materials[kind] += TUNING.dev.materialStep
      store.commit()
      this.refresh()
    }
    this.resetButton = button('Reset save', () => this.reset(), 'danger')

    this.root = el('aside', { class: 'panel dev' }, [
      el('h2', { text: 'Dev  ( ` to close )' }),
      el('h3', { text: 'Time' }),
      this.timeRow,
      el('h3', { text: 'Materials' }),
      el('div', { class: 'row' }, [
        button(`+${TUNING.dev.materialStep} wood`, addMaterial('wood')),
        button(`+${TUNING.dev.materialStep} stone`, addMaterial('stone')),
      ]),
      el('h3', { text: 'Aurora' }),
      this.auroraRow,
      el('h3', { text: 'Jump to' }),
      el(
        'div',
        { class: 'row' },
        AREAS.map((a) =>
          button(a.name, () => {
            placePlayer(store.state, AREA_SPAWNS[a.id])
            store.commit()
          }),
        ),
      ),
      el('h3', { text: 'Save' }),
      el('div', { class: 'row' }, [this.resetButton]),
      this.readout,
    ])
    this.buildToggles()
    this.root.hidden = true
    parent.append(this.root)
  }

  toggle() {
    this.root.hidden = !this.root.hidden
    clearInterval(this.timer)
    if (!this.root.hidden) {
      this.refresh()
      this.timer = window.setInterval(() => this.refresh(), 250)
    }
  }

  private buildToggles() {
    const { clock, dev } = this.ctx
    for (const m of TUNING.dev.timeMultipliers) {
      const b = button(`x${m}`, () => {
        clock.setMultiplier(m)
        this.refresh()
      })
      this.toggles.push([b, () => clock.multiplier === m])
      this.timeRow.append(b)
    }
    const choices: (AuroraStrength | null)[] = [null, ...SKY.aurora.map((a) => a.id)]
    for (const id of choices) {
      const b = button(id ? SKY.aurora.find((a) => a.id === id)!.name : 'Rolled', () => {
        dev.auroraOverride = id
        this.refresh()
      })
      this.toggles.push([b, () => dev.auroraOverride === id])
      this.auroraRow.append(b)
    }
  }

  private refresh() {
    const { store, clock, dev } = this.ctx
    for (const [b, isOn] of this.toggles) b.classList.toggle('on', isOn())

    const s = store.state
    const now = clock.now()
    const sky = skyAt(s, now, dev.auroraOverride)
    const phase = SKY.phases.find((p) => p.id === sky.phase)!
    const aurora = SKY.aurora.find((a) => a.id === sky.aurora)!
    this.readout.textContent = [
      `x ${s.player.x.toFixed(0)}  y ${s.player.y.toFixed(0)}  ${areaAt(s.player.x).name}`,
      `wood ${s.materials.wood}  stone ${s.materials.stone}`,
      `game time ${new Date(now).toLocaleTimeString()}`,
      `night ${sky.night}  ${phase.name} ${(sky.phaseT * 100).toFixed(0)}%`,
      `aurora ${aurora.name}${sky.snow ? ', light snow' : ', clear'}`,
      `saved ${Math.round((Date.now() - s.savedAt) / 1000)}s ago`,
    ].join('\n')
  }

  private async reset() {
    if (!this.resetArmed) {
      this.resetArmed = true
      this.resetButton.textContent = 'Click again to reset'
      setTimeout(() => {
        this.resetArmed = false
        this.resetButton.textContent = 'Reset save'
      }, 3000)
      return
    }
    this.resetArmed = false
    this.resetButton.textContent = 'Reset save'
    this.ctx.clock.setMultiplier(1)
    await this.ctx.store.replace(newGameState(Date.now()))
    this.ctx.clock.restart()
    this.refresh()
  }
}
