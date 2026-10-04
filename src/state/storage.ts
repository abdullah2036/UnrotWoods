/**
 * Everything that touches IndexedDB. Four functions: load, save, export, import.
 * A save that cannot be read is copied aside before a new game replaces it.
 */
import { SAVE_VERSION, type GameState } from './GameState'
import { SaveError, upgradeSave } from './upgrades'

const DB_NAME = 'unrot'
const STORE = 'saves'
const KEY = 'current'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const req = fn(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(req.result)
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

/** Returns the saved game, upgraded to the current version, or null if there is none. */
export async function loadGame(): Promise<GameState | null> {
  const raw = await run('readonly', (s) => s.get(KEY))
  if (raw === undefined) return null
  try {
    const state = upgradeSave(raw)
    const oldVersion = (raw as { saveVersion: number }).saveVersion
    if (oldVersion < SAVE_VERSION) await run('readwrite', (s) => s.put(raw, `backup-v${oldVersion}`))
    return state
  } catch (err) {
    if (!(err instanceof SaveError)) throw err
    await run('readwrite', (s) => s.put(raw, `unreadable-${Date.now()}`))
    console.warn('Unrot: the save could not be read and was kept aside.', err)
    return null
  }
}

export async function saveGame(state: GameState): Promise<void> {
  state.savedAt = Date.now()
  await run('readwrite', (s) => s.put(structuredClone(state), KEY))
}

/** The save as a JSON file. */
export function exportSave(state: GameState): Blob {
  return new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
}

/** Reads a save file. Throws SaveError with a message for the player if it cannot be used. */
export async function importSave(file: Blob): Promise<GameState> {
  let raw: unknown
  try {
    raw = JSON.parse(await file.text())
  } catch {
    throw new SaveError('This file is not an Unrot save.')
  }
  return upgradeSave(raw)
}
