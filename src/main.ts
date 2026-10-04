import * as Phaser from 'phaser'
import './ui/ui.css'
import type { GameContext } from './context'
import { TUNING } from './data/tuning'
import { Clock } from './state/clock'
import { newGameState, type GameState } from './state/GameState'
import { loadGame, saveGame } from './state/storage'
import { Store } from './state/store'
import { Input } from './systems/input'
import { DevPanel } from './ui/devPanel'
import { Menus } from './ui/menus'
import { openSettings } from './ui/settings'
import { WoodsScene } from './world/WoodsScene'

const { view, save } = TUNING

/** The largest whole-number scale that fits the window, so every game pixel is the same size. */
function integerZoom() {
  return Math.max(1, Math.floor(Math.min(innerWidth / view.width, innerHeight / view.height)))
}

async function boot() {
  let loaded: GameState | null = null
  try {
    loaded = await loadGame()
  } catch (err) {
    console.warn('Unrot: storage is unavailable; progress will not be kept.', err)
  }
  const state = loaded ?? newGameState(Date.now())

  const ctx = {} as GameContext
  ctx.clock = new Clock(() => ctx.store.state)
  ctx.store = new Store(state, saveGame, () => ctx.clock.fold(), save.debounceMs)
  ctx.input = new Input()
  ctx.dev = { auroraOverride: null }
  if (!loaded) await ctx.store.saveNow()
  ctx.store.startAutosave(save.autosaveSeconds * 1000)

  const ui = document.getElementById('ui')!
  const fitUi = (zoom: number) => {
    ui.style.width = `${view.width * zoom}px`
    ui.style.height = `${view.height * zoom}px`
    document.documentElement.style.setProperty('--px', String(zoom))
  }

  const game = new Phaser.Game({
    type: Phaser.WEBGL,
    parent: 'game',
    width: view.width,
    height: view.height,
    pixelArt: true,
    backgroundColor: '#04060f',
    banner: false,
    input: { keyboard: false, mouse: false, touch: false, gamepad: false },
    audio: { noAudio: true },
    scale: { mode: Phaser.Scale.NONE, zoom: integerZoom() },
    scene: [new WoodsScene(ctx)],
  })
  fitUi(integerZoom())
  window.addEventListener('resize', () => {
    const zoom = integerZoom()
    game.scale.setZoom(zoom)
    fitUi(zoom)
  })

  const menus = new Menus(ui, ctx.input)
  const devPanel = new DevPanel(ctx, ui)
  ctx.input.on(['Escape'], () => (menus.isOpen ? menus.close() : openSettings(ctx, menus)))
  ctx.input.on(['Backquote', '`'], () => devPanel.toggle())

  // handle for browser test scripts during development
  if (import.meta.env.DEV) Object.assign(window, { unrot: { ctx, game } })
}

void boot()
