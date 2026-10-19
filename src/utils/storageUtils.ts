import type { SddArtifactPackage, SavedInitiativeSummary } from '../types'

const DB_NAME = 'specglow_sdd_db'
const DB_VERSION = 1
const STORE_NAME = 'initiatives'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'))
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Failed to open SpecGlow IndexedDB'))
  })
}

/**
 * Saves or updates an initiative snapshot in IndexedDB
 */
export async function saveInitiativeToDb(pkg: SddArtifactPackage): Promise<void> {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)

      const summary: SavedInitiativeSummary = {
        id: pkg.id,
        title: pkg.title,
        domain: pkg.domain,
        jurisdiction: pkg.jurisdiction,
        targetDepth: pkg.targetDepth,
        storyPoints: pkg.governance?.forecasting?.totalStoryPoints || 0,
        updatedAt: new Date().toISOString(),
        manifestData: pkg
      }

      const request = store.put(summary)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      tx.oncomplete = () => db.close()
    })
  } catch (error) {
    console.warn('[SpecGlow Storage] Failed to persist initiative to IndexedDB:', error)
  }
}

/**
 * Retrieves all saved initiatives sorted by most recently updated
 */
export async function getAllSavedInitiatives(): Promise<SavedInitiativeSummary[]> {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const results = (request.result as SavedInitiativeSummary[]) || []
        // Sort descending by updatedAt
        results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        resolve(results)
      }
      request.onerror = () => reject(request.error)
      tx.oncomplete = () => db.close()
    })
  } catch (error) {
    console.warn('[SpecGlow Storage] Failed to read initiatives from IndexedDB:', error)
    return []
  }
}

/**
 * Deletes an initiative by ID from IndexedDB
 */
export async function deleteInitiativeFromDb(id: string): Promise<void> {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      tx.oncomplete = () => db.close()
    })
  } catch (error) {
    console.warn('[SpecGlow Storage] Failed to delete initiative from IndexedDB:', error)
  }
}

/**
 * Retrieves a single full initiative package by ID
 */
export async function getInitiativeById(id: string): Promise<SddArtifactPackage | null> {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onsuccess = () => {
        const result = request.result as SavedInitiativeSummary | undefined
        resolve(result?.manifestData || null)
      }
      request.onerror = () => reject(request.error)
      tx.oncomplete = () => db.close()
    })
  } catch (error) {
    console.warn('[SpecGlow Storage] Failed to fetch initiative by ID:', error)
    return null
  }
}
