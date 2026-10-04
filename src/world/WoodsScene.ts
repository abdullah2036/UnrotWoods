import * as Phaser from 'phaser'
import type { GameContext } from '../context'
import { TUNING } from '../data/tuning'
import { drawPlaceholderWorld, PlaceholderPlayer, PlaceholderSky } from '../render/placeholder'
import { stepPlayer } from '../systems/movement'
import { skyAt } from '../systems/sky'

const { view, world, camera } = TUNING

/** The outdoor map: walking, the camera and the sky. */
export class WoodsScene extends Phaser.Scene {
  private sky!: PlaceholderSky
  private player!: PlaceholderPlayer
  private camX = 0
  private walking = false

  constructor(private ctx: GameContext) {
    super('woods')
  }

  create() {
    drawPlaceholderWorld(this)
    this.sky = new PlaceholderSky(this)
    this.player = new PlaceholderPlayer(this)
    this.cameras.main.setBounds(0, 0, world.width, view.height)
    this.camX = this.cameraTarget()
  }

  update(_time: number, deltaMs: number) {
    const { store, clock, input, dev } = this.ctx
    const state = store.state
    const dt = Math.min(deltaMs / 1000, 0.1)

    const moved = stepPlayer(state, input.move(), dt)
    if (this.walking && !moved) store.commit()
    this.walking = moved

    // pan while walking; cut straight there after a jump, an import or a reset
    const target = this.cameraTarget()
    if (Math.abs(target - this.camX) > view.width) this.camX = target
    else this.camX += (target - this.camX) * (1 - Math.exp(-camera.follow * dt))
    this.cameras.main.scrollX = Math.round(this.camX)

    const sky = skyAt(state, clock.now(), dev.auroraOverride)
    this.sky.draw(sky.phase, sky.aurora)
    this.player.draw(state.player.x, state.player.y, state.player.facing)
  }

  private cameraTarget() {
    const p = this.ctx.store.state.player
    const x = p.x - view.width / 2 + p.facing * camera.lookAhead
    return Math.max(0, Math.min(world.width - view.width, x))
  }
}
