import { useEffect, useRef } from 'react'
import { useCorbado } from '@corbado/react'
import { useAtomValue } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { sqlInitializingAtom } from '../store.ts'
import { startSyncing } from '../modules/startSyncing.ts'

export const Syncer = () => {
  const db = usePGlite()
  const syncRef = useRef(null)
  const isStartingRef = useRef(false)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

  const { user: authUser } = useCorbado()

  // TODO: ensure syncing resumes after user has changed

  useEffect(() => {
    console.log('Syncer effect running:', { 
      hasDb: !!db, 
      sqlInitializing, 
      hasSyncRef: !!syncRef.current,
      isStarting: isStartingRef.current,
      authUserEmail: authUser?.email 
    })
    
    if (!db) {
      console.log('Syncer: No db, returning')
      return
    }
    if (sqlInitializing) {
      console.log('Syncer: SQL initializing, returning')
      return
    }
    if (syncRef.current || isStartingRef.current) {
      console.log('Syncer: Already syncing or starting, returning')
      return // Don't start if already syncing or starting
    }

    console.log('Syncer: Starting sync...')
    isStartingRef.current = true

    startSyncing(db)
      .then(async (syncObj) => {
        console.log('Syncer: Sync started successfully')
        
        // Debug: Check what's in the database
        const projectTypesCount = await db.query('SELECT COUNT(*) FROM project_types')
        const usersCount = await db.query('SELECT COUNT(*) FROM users')
        const projectsCount = await db.query('SELECT COUNT(*) FROM projects')
        console.log('Syncer: Database contents after sync start:', {
          project_types: projectTypesCount?.rows?.[0]?.count,
          users: usersCount?.rows?.[0]?.count,
          projects: projectsCount?.rows?.[0]?.count,
        })
        
        syncRef.current = syncObj
        isStartingRef.current = false
      })
      .catch((error) => {
        console.error('Syncer: Error starting sync:', error)
        isStartingRef.current = false
      })

    return () => {
      console.log('Syncer: Cleanup running')
      if (syncRef.current) {
        console.log('AuthAndDb.Syncer unsubscribing sync')
        syncRef.current.unsubscribe?.()
        syncRef.current = null
      }
      isStartingRef.current = false
    }
  }, [authUser?.email, db, sqlInitializing])

  return null
}
