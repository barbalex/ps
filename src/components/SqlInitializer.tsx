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
        try {
          await db.exec(`
            ALTER TABLE IF EXISTS auth_sessions ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS auth_accounts ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            ALTER TABLE IF EXISTS auth_accounts DROP CONSTRAINT IF EXISTS auth_accounts_user_id_fkey;
            ALTER TABLE IF EXISTS auth_accounts
              ADD CONSTRAINT auth_accounts_user_id_fkey
              FOREIGN KEY (user_id) REFERENCES users(user_id)
              ON DELETE CASCADE ON UPDATE NO ACTION
              DEFERRABLE INITIALLY DEFERRED;
            ALTER TABLE IF EXISTS accounts DROP CONSTRAINT IF EXISTS accounts_user_id_fkey;
            ALTER TABLE IF EXISTS accounts
              ADD CONSTRAINT accounts_user_id_fkey
              FOREIGN KEY (user_id) REFERENCES users(user_id)
              ON DELETE CASCADE ON UPDATE NO ACTION
              DEFERRABLE INITIALLY DEFERRED;
            ALTER TABLE IF EXISTS auth_verifications ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            CREATE TABLE IF NOT EXISTS auth_passkeys(
              auth_passkey_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
              name text DEFAULT NULL,
              public_key text NOT NULL,
              user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED,
              credential_id text NOT NULL,
              counter integer NOT NULL DEFAULT 0,
              device_type text NOT NULL,
              backed_up boolean NOT NULL DEFAULT FALSE,
              transports text DEFAULT NULL,
              aaguid text DEFAULT NULL,
              sys_period tstzrange DEFAULT NULL,
              created_at timestamptz NOT NULL DEFAULT now(),
              updated_at timestamptz NOT NULL DEFAULT now()
            );
            ALTER TABLE IF EXISTS auth_passkeys ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            CREATE INDEX IF NOT EXISTS auth_passkeys_user_id_idx ON auth_passkeys USING btree(user_id);
            CREATE UNIQUE INDEX IF NOT EXISTS auth_passkeys_credential_id_idx ON auth_passkeys USING btree(credential_id);
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
            ALTER TABLE IF EXISTS places ADD COLUMN IF NOT EXISTS name text DEFAULT NULL;

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

            CREATE OR REPLACE FUNCTION check_taxon_label_trigger()
            RETURNS TRIGGER AS $$
            DECLARE
              is_syncing BOOLEAN;
              _taxon_name TEXT;
              _taxonomy_id uuid;
              _taxonomy_name TEXT;
            BEGIN
              SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
              IF is_syncing THEN
                RETURN OLD;
              END IF;

              IF NEW.taxon_id IS NULL THEN
                _taxon_name := NULL;
              ELSE
                SELECT taxa.name INTO _taxon_name FROM taxa WHERE taxa.taxon_id = NEW.taxon_id;
              END IF;

              IF NEW.taxon_id IS NULL THEN
                _taxonomy_id := NULL;
              ELSE
                SELECT taxa.taxonomy_id INTO _taxonomy_id FROM taxa WHERE taxa.taxon_id = NEW.taxon_id;
              END IF;

              IF _taxonomy_id IS NULL THEN
                _taxonomy_name := NULL;
              ELSE
                SELECT taxonomies.name INTO _taxonomy_name FROM taxonomies WHERE taxonomies.taxonomy_id = _taxonomy_id;
              END IF;

              UPDATE check_taxa
                SET label = (
                  CASE
                    WHEN _taxon_name is null THEN NEW.check_taxon_id::text
                    WHEN _taxonomy_name is null THEN NEW.check_taxon_id::text
                    ELSE _taxonomy_name || ': ' || _taxon_name
                  END
                )
              WHERE check_taxon_id = NEW.check_taxon_id;

              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS check_taxon_label_trigger ON check_taxa;

            CREATE TRIGGER check_taxon_label_trigger
            AFTER UPDATE OF taxon_id OR INSERT ON check_taxa
            FOR EACH ROW
            EXECUTE PROCEDURE check_taxon_label_trigger();

            CREATE OR REPLACE FUNCTION action_taxon_label_trigger()
            RETURNS TRIGGER AS $$
            DECLARE
              is_syncing BOOLEAN;
              _taxon_name TEXT;
              _taxonomy_id uuid;
              _taxonomy_name TEXT;
            BEGIN
              SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
              IF is_syncing THEN
                RETURN OLD;
              END IF;

              IF NEW.taxon_id IS NULL THEN
                _taxon_name := NULL;
              ELSE
                SELECT taxa.name INTO _taxon_name FROM taxa WHERE taxa.taxon_id = NEW.taxon_id;
              END IF;

              IF NEW.taxon_id IS NULL THEN
                _taxonomy_id := NULL;
              ELSE
                SELECT taxa.taxonomy_id INTO _taxonomy_id FROM taxa WHERE taxa.taxon_id = NEW.taxon_id;
              END IF;

              IF _taxonomy_id IS NULL THEN
                _taxonomy_name := NULL;
              ELSE
                SELECT taxonomies.name INTO _taxonomy_name FROM taxonomies WHERE taxonomies.taxonomy_id = _taxonomy_id;
              END IF;

              UPDATE action_taxa
                SET label = (
                  CASE
                    WHEN _taxon_name is null THEN NEW.action_taxon_id::text
                    WHEN _taxonomy_name is null THEN NEW.action_taxon_id::text
                    ELSE _taxonomy_name || ': ' || _taxon_name
                  END
                )
              WHERE action_taxon_id = NEW.action_taxon_id;

              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS action_taxon_label_trigger ON action_taxa;

            CREATE TRIGGER action_taxon_label_trigger
            AFTER UPDATE OF taxon_id OR INSERT ON action_taxa
            FOR EACH ROW
            EXECUTE PROCEDURE action_taxon_label_trigger();

            CREATE OR REPLACE FUNCTION accounts_projects_label_trigger()
            RETURNS TRIGGER AS $$
            DECLARE
              is_syncing BOOLEAN;
            BEGIN
              SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
              IF is_syncing THEN
                RETURN OLD;
              END IF;

              UPDATE projects
                SET label = CASE
                  WHEN NEW.projects_label_by is null THEN projects.name
                  WHEN NEW.projects_label_by = 'name' THEN projects.name
                  ELSE coalesce(projects.data ->> NEW.projects_label_by, projects.project_id::text)
                END
              WHERE projects.account_id = NEW.account_id;

              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS accounts_projects_label_trigger ON accounts;

            CREATE TRIGGER accounts_projects_label_trigger
            AFTER UPDATE OF projects_label_by ON accounts
            FOR EACH ROW
            EXECUTE PROCEDURE accounts_projects_label_trigger();

            CREATE OR REPLACE FUNCTION projects_places_label_trigger()
            RETURNS TRIGGER AS $$
            DECLARE
              is_syncing BOOLEAN;
            BEGIN
              SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
              IF is_syncing THEN
                RETURN OLD;
              END IF;

              UPDATE places
                SET label = CASE
                  WHEN NEW.places_label_by = 'id' THEN places.place_id::text
                  WHEN NEW.places_label_by = 'level' THEN places.level::text
                  WHEN NEW.places_label_by = 'name' THEN coalesce(nullif(places.name, ''), places.place_id::text)
                  WHEN places.data -> NEW.places_label_by is null THEN places.place_id::text
                  ELSE places.data ->> NEW.places_label_by
                END
              WHERE places.subproject_id IN (
                SELECT subprojects.subproject_id
                FROM subprojects
                WHERE subprojects.project_id = NEW.project_id
              );

              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS projects_places_label_trigger ON projects;

            CREATE TRIGGER projects_places_label_trigger
            AFTER UPDATE OF places_label_by ON projects
            FOR EACH ROW
            EXECUTE PROCEDURE projects_places_label_trigger();

            CREATE OR REPLACE FUNCTION places_label_trigger()
            RETURNS TRIGGER AS $$
            DECLARE
              is_syncing BOOLEAN;
              _project_id uuid;
              _project_places_label_by TEXT;
            BEGIN
              SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
              IF is_syncing THEN
                RETURN OLD;
              END IF;

              IF NEW.subproject_id IS NULL THEN
                _project_id := NULL;
              ELSE
                SELECT subprojects.project_id INTO _project_id FROM subprojects WHERE subprojects.subproject_id = NEW.subproject_id;
              END IF;

              IF _project_id IS NULL THEN
                _project_places_label_by := NULL;
              ELSE
                SELECT projects.places_label_by INTO _project_places_label_by FROM projects WHERE projects.project_id = _project_id;
              END IF;

              UPDATE places
                SET label = CASE
                  WHEN _project_places_label_by is null THEN places.place_id::text
                  WHEN _project_places_label_by = 'id' THEN places.place_id::text
                  WHEN _project_places_label_by = 'level' THEN places.level::text
                  WHEN _project_places_label_by = 'name' THEN coalesce(nullif(places.name, ''), places.place_id::text)
                  WHEN places.data -> _project_places_label_by is null THEN places.place_id::text
                  ELSE places.data ->> _project_places_label_by
                END
              WHERE places.place_id = NEW.place_id;

              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS places_label_trigger ON places;

            CREATE TRIGGER places_label_trigger
            AFTER INSERT OR UPDATE OF level, name, data ON places
            FOR EACH ROW
            EXECUTE PROCEDURE places_label_trigger();

            CREATE OR REPLACE FUNCTION projects_goals_label_trigger()
            RETURNS TRIGGER AS $$
            DECLARE
              is_syncing BOOLEAN;
            BEGIN
              SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
              IF is_syncing THEN
                RETURN OLD;
              END IF;

              UPDATE goals
                SET label = CASE
                  WHEN NEW.goals_label_by = 'id' THEN goals.goal_id::text
                  WHEN goals.data -> NEW.goals_label_by is null THEN goals.goal_id::text
                  ELSE goals.data ->> NEW.goals_label_by
                END
              WHERE goals.subproject_id IN (
                SELECT subprojects.subproject_id
                FROM subprojects
                WHERE subprojects.project_id = NEW.project_id
              );

              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS projects_goals_label_trigger ON projects;

            CREATE TRIGGER projects_goals_label_trigger
            AFTER UPDATE OF goals_label_by ON projects
            FOR EACH ROW
            EXECUTE PROCEDURE projects_goals_label_trigger();
          `)
        } catch (error) {
          console.error(
            'Error installing sync duplicate-guard triggers:',
            error,
          )
        }

        const syncIgnoreDuplicateInsertTriggersSql = (
          await import(`../sql/syncIgnoreDuplicateInsertTriggers.sql?raw`)
        ).default
        try {
          await db.exec(syncIgnoreDuplicateInsertTriggersSql)
        } catch (error) {
          console.error(
            'Error executing syncIgnoreDuplicateInsertTriggersSql:',
            error,
          )
        }

        setSqlInitializing(false)
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
      const syncIgnoreDuplicateInsertTriggersSql = (
        await import(`../sql/syncIgnoreDuplicateInsertTriggers.sql?raw`)
      ).default
      try {
        await db.exec(syncIgnoreDuplicateInsertTriggersSql)
      } catch (error) {
        console.error('Error executing syncIgnoreDuplicateInsertTriggersSql:', error)
      }

      setSqlInitializing(false)
    }

    run()
  }, [db, setSqlInitializing])

  return null
}
