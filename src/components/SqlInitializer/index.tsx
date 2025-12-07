import { useEffect } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'

// import { seedTestData } from './seedTestData.ts'

export const SqlInitializer = () => {
  const db = usePGlite()

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

      if (projectsTableExists) return

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
      // await seedTestData(db)
    }

    run()
  }, [db])

  return null
}
