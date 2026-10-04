/**
 * Grey stand-in art for milestone 1: flat blocks for each area, the river,
 * distance posts and a box for the player. Replaced by real art in milestone 2.
 */
import * as Phaser from 'phaser'
import { AREAS, RIVER } from '../data/areas'
import type { AuroraStrength, SkyPhaseId } from '../data/sky'
import { TUNING } from '../data/tuning'

const { world, view } = TUNING
const GROUND_Y = world.walkTop - 14

const SKY_GREYS: Record<SkyPhaseId, number> = {
  dusk: 0x5c5c66,
  night: 0x3c3c46,
  deepNight: 0x24242c,
  dawn: 0x4c5262,
}
const AURORA_BAND: Record<AuroraStrength, number> = { faint: 6, ribbon: 18, curtains: 48, full: 110 }

export function drawPlaceholderWorld(scene: Phaser.Scene) {
  const g = scene.add.graphics()
  AREAS.forEach((a, i) => {
    g.fillStyle(i % 2 ? 0x77777c : 0x6c6c72)
    g.fillRect(a.x0, GROUND_Y, a.x1 - a.x0, view.height - GROUND_Y)
    g.fillStyle(0x8a8a90)
    g.fillRect(a.x0, GROUND_Y, 1, view.height - GROUND_Y)
    scene.add
      .text(a.x0 + 6, GROUND_Y + 3, a.name.toUpperCase(), { fontFamily: 'monospace', fontSize: '8px', color: '#d8d8dc' })
      .setResolution(1)
  })
  // the walkable strip
  g.fillStyle(0x84848a)
  g.fillRect(0, world.walkTop - 2, world.width, world.walkBottom - world.walkTop + 4)
  // the river cuts through the strip
  g.fillStyle(0x34343c)
  g.fillRect(RIVER.x0, GROUND_Y, RIVER.x1 - RIVER.x0, view.height - GROUND_Y)
  // posts every 80px so movement is easy to see
  for (let x = 40; x < world.width; x += 80) {
    if (x > RIVER.x0 - 4 && x < RIVER.x1 + 4) continue
    g.fillStyle(0x4a4a50)
    g.fillRect(x, world.walkTop - 22, 3, 20)
  }
}

export class PlaceholderSky {
  private g: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.g = scene.add.graphics().setScrollFactor(0).setDepth(-10)
  }

  draw(phase: SkyPhaseId, aurora: AuroraStrength) {
    this.g.clear()
    this.g.fillStyle(SKY_GREYS[phase])
    this.g.fillRect(0, 0, view.width, GROUND_Y)
    this.g.fillStyle(0x9a9aa4, 0.5)
    this.g.fillRect(0, 20, view.width, AURORA_BAND[aurora])
  }
}

export class PlaceholderPlayer {
  private g: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.g = scene.add.graphics().setDepth(10)
  }

  draw(x: number, y: number, facing: 1 | -1) {
    const g = this.g
    g.clear()
    g.setPosition(Math.round(x), Math.round(y))
    g.fillStyle(0x1c1c22)
    g.fillRect(-4, -16, 8, 16)
    g.fillStyle(0xbdbdc4)
    g.fillRect(-3, -15, 6, 5)
    g.fillStyle(0x1c1c22)
    g.fillRect(facing > 0 ? 1 : -2, -13, 1, 1)
  }
}
