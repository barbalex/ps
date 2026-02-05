import { useEffect } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom, useAtomValue } from 'jotai'

import { seedTestData } from './seedTestData.ts'
import {
  sqlInitializingAtom,
  setSqlInitializingFalseAfterTimeoutAtom,
  postgrestClientAtom,
} from '../../store.ts'

export const SqlInitializer = () => {
  const db = usePGlite()
  const postgrestClient = useAtomValue(postgrestClientAtom)
  const setInitializing = useSetAtom(sqlInitializingAtom)
  const setSqlInitializingFalseAfterTimeout = useSetAtom(
    setSqlInitializingFalseAfterTimeoutAtom,
  )

  useEffect(() => {
    const run = async () => {
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

      if (projectsTableExists) return setSqlInitializingFalseAfterTimeout()

      // create functions, tables and triggers

      const immutableDateSql = (await import(`../../sql/immutableDate.sql?raw`))
        .default
      try {
        await db.exec(immutableDateSql)
      } catch (error) {
        console.error('SqlInitializer, error creating immutableDate:', error)
      }
      const uuidv7Sql = (await import(`../../sql/uuidv7.sql?raw`)).default
      try {
        await db.exec(uuidv7Sql)
      } catch (error) {
        console.error('SqlInitializer, error creating uuidv7:', error)
      }
      const createSql = (await import(`../../sql/createTables.sql?raw`)).default
      try {
        await db.exec(createSql)
      } catch (error) {
        console.error('SqlInitializer, error creating tables:', error)
      }
      const triggersSql = (await import(`../../sql/triggers.sql?raw`)).default
      try {
        await db.exec(triggersSql)
      } catch (error) {
        console.error('SqlInitializer, error creating triggers:', error)
      }

      // Only seed test data if backend database is empty
      // Check for the specific test user that gets seeded
      if (postgrestClient) {
        try {
          const { data: users, error } = await postgrestClient
            .from('users')
            .select('user_id')
            .eq('user_id', '018cf95a-d817-7000-92fa-bb3b2ad59dda')
            .limit(1)

          if (error) throw error

          if (!users || users.length === 0) {
            console.log('Test user not found in backend, seeding test data...')
            await seedTestData(db)
          } else {
            console.log('Test user found in backend, skipping seed')
          }
        } catch (error) {
          console.error('SqlInitializer, error checking backend:', error)
          // If backend check fails, seed anyway for offline development
          await seedTestData(db)
        }
      } else {
        // If postgrest client not ready, seed anyway
        console.log('Postgrest client not ready, seeding test data...')
        await seedTestData(db)
      }

      setSqlInitializingFalseAfterTimeout(false)
    }

    run()
  }, [
    db,
    postgrestClient,
    setInitializing,
    setSqlInitializingFalseAfterTimeout,
  ])

  return null
}
