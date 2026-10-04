/** Tuning numbers. Distances are in world pixels, speeds in pixels per second. */
export const TUNING = {
  view: { width: 480, height: 270 },

  world: {
    width: 3840,
    /** the walkable strip: the player's feet stay between these two y values */
    walkTop: 214,
    walkBottom: 252,
  },

  player: {
    walkSpeed: 62,
    depthSpeed: 34,
    /** half the player's width, used to keep them out of blocked ground */
    halfWidth: 4,
    spawnX: 1080,
    spawnY: 236,
  },

  camera: {
    /** how quickly the camera catches up, per second */
    follow: 5,
    /** how far ahead of the player the camera looks, in the walking direction */
    lookAhead: 28,
  },

  save: {
    autosaveSeconds: 30,
    /** a burst of changes is written once, this long after the last one */
    debounceMs: 250,
  },

  dev: {
    timeMultipliers: [1, 10, 60],
    materialStep: 10,
  },
}
