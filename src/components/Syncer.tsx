import { useEffect, useRef } from 'react'
import { useCorbado } from '@corbado/react'
import { useAtomValue } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { sqlInitializingAtom } from '../store.ts'
import { startSyncing } from '../modules/startSyncing.ts'

// Module-level flag to prevent multiple sync attempts across component remounts
let globalSyncStarted = false
let globalSyncObject = null
let globalSyncStartTime = 0

export const Syncer = () => {
  const db = usePGlite()
  const syncRef = useRef(null)
  const isStartingRef = useRef(false)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

  const { user: authUser } = useCorbado()

  // TODO: ensure syncing resumes after user has changed

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastStart = now - globalSyncStartTime
    
    console.log('Syncer effect running:', {
      hasDb: !!db,
      sqlInitializing,
      hasSyncRef: !!syncRef.current,
      isStarting: isStartingRef.current,
      globalSyncStarted,
      timeSinceLastStart,
      authUserEmail: authUser?.email,
    })

    if (!db) {
      console.log('Syncer: No db, returning')
      return
    }
    if (sqlInitializing) {
      console.log('Syncer: SQL initializing, returning')
      return
    }
    if (globalSyncStarted || syncRef.current || isStartingRef.current) {
      console.log(
        'Syncer: Already syncing or starting (global or local), returning',
      )
      // If we already have a global sync object, reuse it
      if (globalSyncObject && !syncRef.current) {
        syncRef.current = globalSyncObject
      }
      return
    }

    console.log('Syncer: Starting sync...')
    globalSyncStarted = true
    globalSyncStartTime = Date.now()
    isStartingRef.current = true

    startSyncing(db)
      .then(async (syncObj) => {
        console.log('Syncer: Sync started successfully')

        // Debug: Check what's in the database
        const projectTypesCount = await db.query(
          'SELECT COUNT(*) FROM project_types',
        )
        const usersCount = await db.query('SELECT COUNT(*) FROM users')
        const projectsCount = await db.query('SELECT COUNT(*) FROM projects')
        console.log('Syncer: Database contents after sync start:', {
          project_types: projectTypesCount?.rows?.[0]?.count,
          users: usersCount?.rows?.[0]?.count,
          projects: projectsCount?.rows?.[0]?.count,
        })

        syncRef.current = syncObj
        globalSyncObject = syncObj
        isStartingRef.current = false

        // Log when sync object receives live updates
        console.log('Syncer: Setting up live update monitoring...')
        if (syncObj.isUpToDate !== undefined) {
          console.log('Syncer: Initial isUpToDate:', syncObj.isUpToDate)
        }
      })
      .catch((error) => {
        console.error('Syncer: Error starting sync:', error)
        // Reset flags on error so user can retry
        globalSyncStarted = false
        isStartingRef.current = false
      })

    return () => {
      console.log('Syncer: Cleanup running')
      // Keep sync alive - don't unsubscribe
      // The sync object with its WebSocket connections needs to persist
      isStartingRef.current = false
    }
  }, [db, sqlInitializing]) // removed authUser?.email to prevent restarts. TODO: revisit when implementing auth (user switching)

  return null
}
