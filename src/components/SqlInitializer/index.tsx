import { useEffect, useRef } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom, useAtomValue } from 'jotai'

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
  const hasRunRef = useRef(false)
  const isRunningRef = useRef(false)

  useEffect(() => {
    const run = async () => {
      // Prevent multiple simultaneous runs
      if (hasRunRef.current || isRunningRef.current) {
        return
      }

      isRunningRef.current = true
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
        hasRunRef.current = true
        isRunningRef.current = false
        return setSqlInitializingFalseAfterTimeout()
      }

      // create functions, tables and triggers

      const immutableDateSql = (await import(`../../sql/immutableDate.sql?raw`))
        .default
      try {
        await db.exec(immutableDateSql)
      } catch {
        isRunningRef.current = false
        return setSqlInitializingFalseAfterTimeout()
      }
      const uuidv7Sql = (await import(`../../sql/uuidv7.sql?raw`)).default
      try {
        await db.exec(uuidv7Sql)
      } catch {
        isRunningRef.current = false
        return setSqlInitializingFalseAfterTimeout()
      }
      const createSql = (await import(`../../sql/createTables.sql?raw`)).default
      try {
        await db.exec(createSql)
      } catch {
        isRunningRef.current = false
        return setSqlInitializingFalseAfterTimeout()
      }
      const triggersSql = (await import(`../../sql/triggers.sql?raw`)).default
      try {
        await db.exec(triggersSql)
      } catch {
        isRunningRef.current = false
        return setSqlInitializingFalseAfterTimeout()
      }

      console.log(
        'SqlInitializer: All SQL operations complete, scheduling sqlInitializing=false after timeout',
      )

      hasRunRef.current = true
      isRunningRef.current = false

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
