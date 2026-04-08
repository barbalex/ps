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
            ALTER TABLE IF EXISTS auth_sessions ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS auth_accounts ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS auth_verifications ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS subproject_taxa ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS units ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS messages ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS user_messages ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS field_types ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS widget_types ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS widgets_for_fields ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS fields ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS field_sorts ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS vector_layer_geoms ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS layer_presentations ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS crs ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;

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

            CREATE OR REPLACE FUNCTION taxonomies_sync_ignore_duplicate_insert_trigger()
            RETURNS TRIGGER AS $$
            DECLARE
              is_syncing BOOLEAN;
            BEGIN
              SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;

              IF is_syncing AND EXISTS (
                SELECT 1
                FROM taxonomies
                WHERE taxonomy_id = NEW.taxonomy_id
              ) THEN
                RETURN NULL;
              END IF;

              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS taxonomies_sync_ignore_duplicate_insert_trigger ON taxonomies;

            CREATE TRIGGER taxonomies_sync_ignore_duplicate_insert_trigger
            BEFORE INSERT ON taxonomies
            FOR EACH ROW
            EXECUTE PROCEDURE taxonomies_sync_ignore_duplicate_insert_trigger();

            CREATE OR REPLACE FUNCTION subproject_taxon_label_trigger()
            RETURNS TRIGGER AS $$
            DECLARE
              is_syncing BOOLEAN;
              taxon_name TEXT;
              _taxonomy_id uuid;
              taxonomy_name TEXT;
            BEGIN
              SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
              IF is_syncing THEN
                RETURN OLD;
              END IF;

              IF NEW.taxon_id IS NULL THEN
                taxon_name := NULL;
              ELSE
                SELECT taxa.name INTO taxon_name FROM taxa WHERE taxa.taxon_id = NEW.taxon_id;
              END IF;

              IF NEW.taxon_id IS NULL THEN
                _taxonomy_id := NULL;
              ELSE
                SELECT taxa.taxonomy_id INTO _taxonomy_id FROM taxa WHERE taxa.taxon_id = NEW.taxon_id;
              END IF;

              IF _taxonomy_id IS NULL THEN
                taxonomy_name := NULL;
              ELSE
                SELECT taxonomies.name INTO taxonomy_name FROM taxonomies WHERE taxonomies.taxonomy_id = _taxonomy_id;
              END IF;

              UPDATE subproject_taxa
                SET label = (
                  CASE
                    WHEN taxon_name is null THEN NEW.subproject_taxon_id::text
                    ELSE taxonomy_name || ': ' || taxon_name
                  END
                )
              WHERE subproject_taxon_id = NEW.subproject_taxon_id;

              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS subproject_taxon_label_trigger ON subproject_taxa;

            CREATE TRIGGER subproject_taxon_label_trigger
            AFTER INSERT OR UPDATE OF taxon_id ON subproject_taxa
            FOR EACH ROW
            EXECUTE PROCEDURE subproject_taxon_label_trigger();
          `)
        } catch (error) {
          console.error(
            'Error installing sync duplicate-guard triggers:',
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
