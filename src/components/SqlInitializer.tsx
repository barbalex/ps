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

      const resultLayerPresentationsTableExists = await db.query(
        `
          SELECT EXISTS (
            SELECT FROM pg_tables
            WHERE  schemaname = 'public'
            AND    tablename  = 'layer_presentations'
          )
        `,
      )
      const layerPresentationsTableExists =
        resultLayerPresentationsTableExists?.rows?.[0]?.exists

      // Always run: remove duplicate layer_presentations per vector_layer_id
      // (can be created by a previous bug; trigger prevents new ones)
      if (layerPresentationsTableExists) {
        try {
          await db.exec(`
            DELETE FROM layer_presentations
            WHERE layer_presentation_id NOT IN (
              SELECT DISTINCT ON (vector_layer_id) layer_presentation_id
              FROM layer_presentations
              WHERE vector_layer_id IS NOT NULL
              ORDER BY vector_layer_id, active DESC, layer_presentation_id
            )
            AND vector_layer_id IS NOT NULL
          `)
        } catch (error) {
          console.error('Error deduplicating layer_presentations:', error)
        }
      }

      // this is probably not needed
      if (projectsTableExists) {
        // Run migrations for columns added after initial schema creation
        try {
          await db.exec(`
            ALTER TABLE qcs ADD COLUMN IF NOT EXISTS filter_by_year boolean DEFAULT false;
          `)
        } catch (error) {
          console.error('Error running qcs migration:', error)
        }
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
