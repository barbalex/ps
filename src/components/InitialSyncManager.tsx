import { useEffect } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtomValue, useSetAtom } from 'jotai'

import {
  firstRunDbInitAtom,
  initialSyncingAtom,
  sqlInitializingAtom,
} from '../store.ts'

// Watch for synced data reactively. On reloads of an existing database this
// ends the initial-sync phase as soon as data is confirmed present, instead
// of waiting for Electric's onInitialSync callback (which can fire much
// later, e.g. after a 409 shape-exists continuation). On a FIRST run the
// full transfer must complete before the app becomes usable, so there the
// phase is left to onInitialSync in startSyncing.
const InitialSyncWatcher = () => {
  const setInitialSyncing = useSetAtom(initialSyncingAtom)
  const firstRunDbInit = useAtomValue(firstRunDbInitAtom)

  const projectsResult = useLiveQuery<{ exists: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM projects LIMIT 1)`,
  )

  useEffect(() => {
    // Don't run while the live query is still loading
    if (projectsResult === undefined) return
    // On first login the UI must wait for the FULL initial sync
    if (firstRunDbInit) return

    const projectExists = projectsResult?.rows?.[0]?.exists ?? false
    if (projectExists) {
      // if project exists, we can assume initial sync has happened
      setInitialSyncing(false)
    }
  }, [projectsResult, setInitialSyncing, firstRunDbInit])

  return null
}

export const InitialSyncManager = () => {
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

  // The watcher's live query targets the projects table, which only exists
  // once SQL initialization has created the schema.
  if (sqlInitializing) return null
  return <InitialSyncWatcher />
}
