import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { newGameState } from '../src/state/GameState'
import { exportSave, importSave, loadGame, saveGame } from '../src/state/storage'
import { SaveError } from '../src/state/upgrades'

async function rawPut(key: string, value: unknown) {
  const db = await new Promise<IDBDatabase>((res, rej) => {
    const r = indexedDB.open('unrot', 1)
    r.onupgradeneeded = () => r.result.createObjectStore('saves')
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
  await new Promise<void>((res, rej) => {
    const tx = db.transaction('saves', 'readwrite')
    tx.objectStore('saves').put(value, key)
    tx.oncomplete = () => res()
    tx.onerror = () => rej(tx.error)
  })
  const keys = await new Promise<IDBValidKey[]>((res) => {
    const r = db.transaction('saves').objectStore('saves').getAllKeys()
    r.onsuccess = () => res(r.result)
  })
  db.close()
  return keys
}

beforeEach(async () => {
  await new Promise<void>((res) => {
    const r = indexedDB.deleteDatabase('unrot')
    r.onsuccess = () => res()
    r.onerror = () => res()
  })
})

describe('storage', () => {
  it('has no save on first run', async () => {
    expect(await loadGame()).toBeNull()
  })

  it('loads exactly what was saved', async () => {
    const s = newGameState(1000, 9)
    s.player.x = 2222.5
    s.player.y = 240
    s.player.facing = -1
    s.materials.wood = 14
    s.clock.offsetMs = 3_540_000
    await saveGame(s)
    expect(await loadGame()).toEqual(s)
  })

  it('keeps an unreadable save aside instead of losing it', async () => {
    await rawPut('current', { saveVersion: 1, player: 'broken' })
    expect(await loadGame()).toBeNull()
    const keys = await rawPut('probe', 1)
    expect(keys.some((k) => String(k).startsWith('unreadable-'))).toBe(true)
  })

  it('exports and imports a save', async () => {
    const s = newGameState(1000, 9)
    s.materials.stone = 7
    const back = await importSave(exportSave(s))
    expect(back).toEqual(s)
  })

  it('refuses to import a file that is not a save', async () => {
    await expect(importSave(new Blob(['not json']))).rejects.toThrow(SaveError)
    await expect(importSave(new Blob(['{"hello":1}']))).rejects.toThrow(SaveError)
  })
})
