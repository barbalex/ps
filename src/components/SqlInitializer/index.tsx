import { useEffect } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { sqlInitializingAtom, initialSyncingAtom } from '../../store.ts'

export const SqlInitializer = () => {
  const db = usePGlite()
  const setSqlInitializing = useSetAtom(sqlInitializingAtom)
  const setInitialSyncing = useSetAtom(initialSyncingAtom)

  useEffect(() => {
    const run = async () => {
      // 1. initialize pgLite db
      const resultProjectsTableExists = await db.query(
        `
          SELECT EXISTS (
            SELECT FROM pg_tables
            WHERE  schemaname = 'public'
            AND    tablename  = 'projects'
          )
        `,
      )
      const projectsTableExists = resultProjectsTableExists?.rows?.[0]?.exists
      if (projectsTableExists) {
        setSqlInitializing(false)
      } else {
        // need to create functions, tables and triggers
        const immutableDateSql = (
          await import(`../../sql/immutableDate.sql?raw`)
        ).default
        try {
          await db.exec(immutableDateSql)
        } catch {
          console.error('Error executing immutableDateSql:', error)
        }
        const uuidv7Sql = (await import(`../../sql/uuidv7.sql?raw`)).default
        try {
          await db.exec(uuidv7Sql)
        } catch {
          console.error('Error executing uuidv7Sql:', error)
        }
        const createSql = (await import(`../../sql/createTables.sql?raw`))
          .default
        try {
          await db.exec(createSql)
        } catch {
          console.error('Error executing createSql:', error)
        }
        const triggersSql = (await import(`../../sql/triggers.sql?raw`)).default
        try {
          await db.exec(triggersSql)
        } catch {
          console.error('Error executing triggersSql:', error)
        }
        setSqlInitializing(false)
      }

      // 2. manage initiallySynced
      const projectExistsResult = await db.query(
        `SELECT EXISTS (SELECT 1 FROM projects LIMIT 1)`,
      )
      const projectExists = projectExistsResult?.rows?.[0]?.exists ?? false
      if (projectExists) {
        // if project exists, we can assume initial sync has happened
        setInitialSyncing(false)
      }
    }

    run()
  }, [db, setInitialSyncing, setSqlInitializing])

  return null
}
