import { useEffect } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { sqlInitializingAtom } from '../store.ts'
import { startSyncing } from '../modules/startSyncing.ts'

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
        try {
          await db.exec(`
            CREATE OR REPLACE FUNCTION taxa_sync_ignore_duplicate_insert_trigger()
            RETURNS TRIGGER AS $$
            DECLARE
              is_syncing BOOLEAN;
            BEGIN
              SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;

              IF is_syncing AND EXISTS (
                SELECT 1
                FROM taxa
                WHERE taxon_id = NEW.taxon_id
              ) THEN
                RETURN NULL;
              END IF;

              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS taxa_sync_ignore_duplicate_insert_trigger ON taxa;

            CREATE TRIGGER taxa_sync_ignore_duplicate_insert_trigger
            BEFORE INSERT ON taxa
            FOR EACH ROW
            EXECUTE PROCEDURE taxa_sync_ignore_duplicate_insert_trigger();
          `)
        } catch (error) {
          console.error(
            'Error installing taxa sync duplicate-guard trigger:',
            error,
          )
        }

        setSqlInitializing(false)
        try {
          await startSyncing()
          console.log('Sync started from SqlInitializer')
        } catch (error) {
          console.error('Error starting sync from SqlInitializer:', error)
        }
        return
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
      try {
        await db.exec(`CREATE EXTENSION IF NOT EXISTS postgis;`)
      } catch (error) {
        console.error('Error creating postgis extension:', error)
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
      try {
        await startSyncing()
        console.log('Sync started from SqlInitializer')
      } catch (error) {
        console.error('Error starting sync from SqlInitializer:', error)
      }
    }

    run()
  }, [db, setSqlInitializing])

  return null
}
