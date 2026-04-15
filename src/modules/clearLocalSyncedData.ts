import {
  initialSyncingAtom,
  operationsQueueAtom,
  pgliteDbAtom,
  store,
  syncObjectAtom,
} from '../store.ts'
import { invalidatePostgrestToken } from './fetchPostgrestToken.ts'

const deleteIndexedDbDatabase = (dbName: string) =>
  new Promise<boolean>((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(true)
      return
    }

    const request = indexedDB.deleteDatabase(dbName)
    request.onsuccess = () => resolve(true)
    request.onerror = () => resolve(false)
    request.onblocked = () => resolve(false)
  })

const deleteAppIndexedDbDatabases = async () => {
  const fallbackDbNames = ['ps', 'idb://ps']
  const discoveredDbNames =
    typeof indexedDB !== 'undefined' && 'databases' in indexedDB
      ? await indexedDB
          .databases()
          .then((dbs) => dbs.map((db) => db.name).filter(Boolean) as string[])
          .catch(() => [])
      : []

  const dbNamesToDelete = [
    ...new Set([...fallbackDbNames, ...discoveredDbNames]),
  ].filter((name) => /ps|pglite|electric/i.test(name))

  const deleteResults = await Promise.all(
    dbNamesToDelete.map((name) => deleteIndexedDbDatabase(name)),
  )

  return deleteResults.every(Boolean)
}

const clearBrowserCaches = async () => {
  if (typeof caches === 'undefined') return
  try {
    const cacheKeys = await caches.keys()
    await Promise.all(cacheKeys.map((key) => caches.delete(key)))
  } catch {
    // ignore cache cleanup failures
  }
}

const clearPersistedSyncUiState = () => {
  const localStorageKeysToKeep = new Set([
    'language',
    'enforceDesktopNavigation',
    'enforceMobileNavigation',
    'isDesktopView',
  ])

  for (const key of Object.keys(window.localStorage)) {
    if (!localStorageKeysToKeep.has(key)) {
      window.localStorage.removeItem(key)
    }
  }

  const sessionStorageKeysToKeep = new Set<string>()
  for (const key of Object.keys(window.sessionStorage)) {
    if (!sessionStorageKeysToKeep.has(key)) {
      window.sessionStorage.removeItem(key)
    }
  }

  // Keep explicit list for readability and future discoverability
  const localStorageKeysToClear = [
    'userIdAtom',
    'userEmailAtom',
    'tabsAtom',
    'operationsQueueAtom',
    'initialSyncingAtom',
    'mapMaximizedAtom',
    'showLocalMapAtom',
    'localMapValuesAtom',
    'mapInfoAtom',
    'mapLayerSortingAtom',
    'mapDrawerVectorLayerDisplayAtom',
    'treeOpenNodesAtom',
    'seenWmsServiceKeysAtom',
    'seenWfsServiceKeysAtom',
    'qcsRunOnlyWithResults',
    'qcsRunLabelFilter',
    'rootQcsRunOnlyWithResults',
    'rootQcsRunLabelFilter',
    'projectQcsRunOnlyWithResults',
    'projectQcsRunLabelFilter',
  ]

  for (const key of localStorageKeysToClear) {
    window.localStorage.removeItem(key)
  }
}

export const clearLocalSyncedData = async () => {
  invalidatePostgrestToken()

  // stop active sync stream before deleting local database
  const syncObject = store.get(syncObjectAtom) as {
    unsubscribe?: () => void
  } | null
  syncObject?.unsubscribe?.()
  store.set(syncObjectAtom, null)

  const db = store.get(pgliteDbAtom) as { close?: () => Promise<void> | void }
  await db?.close?.()

  const dbDeletionSucceeded = await deleteAppIndexedDbDatabases()
  await clearBrowserCaches()
  clearPersistedSyncUiState()

  store.set(pgliteDbAtom, null)
  store.set(operationsQueueAtom, [])
  store.set(initialSyncingAtom, true)

  // If IndexedDB deletion was blocked (another tab/process), force restart path anyway.
  if (!dbDeletionSucceeded) {
    console.warn(
      'Some local IndexedDB databases could not be deleted completely.',
    )
  }
}
