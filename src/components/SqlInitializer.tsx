import { useEffect } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { sqlInitializingAtom } from '../store.ts'

export const SqlInitializer = () => {
  const db = usePGlite()
  const setSqlInitializing = useSetAtom(sqlInitializingAtom)

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
        return setSqlInitializing(false)
      }

      // need to create functions, tables and triggers
      const immutableDateSql = (await import(`../sql/immutableDate.sql?raw`))
        .default
      try {
        await db.exec(immutableDateSql)
      } catch (error) {
        console.error('Error executing immutableDateSql:', error)
      }
      const uuidv7Sql = (await import(`../sql/uuidv7.sql?raw`)).default
      try {
        await db.exec(uuidv7Sql)
      } catch (error) {
        console.error('Error executing uuidv7Sql:', error)
      }
      const createSql = (await import(`../sql/createTables.sql?raw`)).default
      try {
        await db.exec(createSql)
      } catch (error) {
        console.error('Error executing createSql:', error)
      }
      const triggersSql = (await import(`../sql/triggers.sql?raw`)).default
      try {
        await db.exec(triggersSql)
      } catch (error) {
        console.error('Error executing triggersSql:', error)
      }

      setSqlInitializing(false)
    }

    run()
  }, [db, setSqlInitializing])

  return null
}
