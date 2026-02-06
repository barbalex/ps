import { useEffect, useRef } from 'react'
import { useAtomValue } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { sqlInitializingAtom } from '../store.ts'
// import { startSyncing } from '../modules/startSyncing.ts'
import { startSyncingUsersOnly } from '../modules/startSyncingUsersOnly.ts'
import { startSyncingSingly } from '../modules/startSyncingSingly.ts'

export const Syncer = () => {
  const db = usePGlite()
  const sqlInitializing = useAtomValue(sqlInitializingAtom)
  const syncRef = useRef(null)

  // TODO: ensure syncing resumes after user has changed

  useEffect(() => {
    console.log('Syncer effect running:', {
      hasDb: !!db,
      sqlInitializing,
    })

    if (!db) {
      console.log('Syncer: No db, returning')
      return
    }
    if (sqlInitializing) {
      console.log('Syncer: SQL initializing, returning')
      return
    }

    console.log('Syncer: Starting sync...')

    // startSyncing(db)
    //   .then(async (syncObj) => {
    //     console.log('Syncer: Sync started successfully')

    //     // Debug: Check what's in the database
    //     const projectTypesCount = await db.query(
    //       'SELECT COUNT(*) FROM project_types',
    //     )
    //     const usersCount = await db.query('SELECT COUNT(*) FROM users')
    //     const projectsCount = await db.query('SELECT COUNT(*) FROM projects')
    //     console.log('Syncer: Database contents after sync start:', {
    //       project_types: projectTypesCount?.rows?.[0]?.count,
    //       users: usersCount?.rows?.[0]?.count,
    //       projects: projectsCount?.rows?.[0]?.count,
    //     })

    //     // Log when sync object receives live updates
    //     console.log('Syncer: Setting up live update monitoring...')
    //     if (syncObj.isUpToDate !== undefined) {
    //       console.log('Syncer: Initial isUpToDate:', syncObj.isUpToDate)
    //     }
    //   })
    //   .catch((error) => {
    //     console.error('Syncer: Error starting sync:', error)
    //     // Reset flags on error so user can retry
    //   })

    startSyncingUsersOnly(db)
      .then((syncObj) => {
        console.log('Syncer: Users-only sync started successfully')
        syncRef.current = syncObj
      })
      .catch((error) => {
        console.error('Syncer: Error starting users-only sync:', error)
        // Reset flags on error so user can retry
      })

    return () => {
      console.log('Syncer: Cleanup running')
      // unsubscribe from sync when component unmounts
      if (syncRef.current) {
        console.log('Syncer: Unsubscribing from sync')
        syncRef.current?.unsubscribe?.()
        syncRef.current = null
      }
    }
  }, [db, sqlInitializing]) // removed authUser?.email to prevent restarts. TODO: revisit when implementing auth (user switching)

  return null
}
