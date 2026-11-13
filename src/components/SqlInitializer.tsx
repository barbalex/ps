import { useEffect } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { firstRunDbInitAtom, sqlInitializingAtom } from '../store.ts'
import { bootTrace } from '../modules/bootTrace.ts'

/**
 * The whole routine this component runs — the heal/alter/trigger script, the
 * layer_presentations dedup scan, several idempotent sql files — used to
 * execute on EVERY page load. It now runs only when the sql sources changed:
 * a hash over everything it would execute is stamped into a local-only meta
 * table, and an unchanged stamp skips the routine entirely (one cheap SELECT
 * instead of hundreds of statements per boot).
 *
 * The stamp is written only after every statement succeeded, so a partial
 * run retries on the next load. Changing any of the sql sources (or the
 * scripts below) changes the hash and re-runs the routine once.
 */

const SQL_INIT_STAMP_KEY = 'sql_init_sources_hash'

// FNV-1a 32-bit — change detection for the sql sources, not security
const hashString = (str: string): string => {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16)
}

// remove duplicate layer_presentations per vector_layer_id (can be created
// by a previous bug; trigger prevents new ones)
const dedupLayerPresentationsSql = `
            DELETE FROM layer_presentations
            WHERE layer_presentation_id NOT IN (
              SELECT DISTINCT ON (vector_layer_id) layer_presentation_id
              FROM layer_presentations
              WHERE vector_layer_id IS NOT NULL
              ORDER BY vector_layer_id, active DESC, layer_presentation_id
            )
            AND vector_layer_id IS NOT NULL
          `

// heals local databases created before the schema caught up: column
// renames, added columns, label triggers — extracted verbatim, previously
// inline below
const healExistingDbSql = `
            -- the users→roles rename (2026-08) missed these flag columns;
            -- heal local databases created before the schema caught up
            DO $$
            BEGIN
              IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'projects'
                  AND column_name = 'subproject_users_in_subproject'
              ) AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'projects'
                  AND column_name = 'subproject_roles_in_subproject'
              ) THEN
                ALTER TABLE projects RENAME COLUMN subproject_users_in_subproject TO subproject_roles_in_subproject;
              END IF;
              IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'place_levels'
                  AND column_name = 'place_users_in_place'
              ) AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'place_levels'
                  AND column_name = 'place_roles_in_place'
              ) THEN
                ALTER TABLE place_levels RENAME COLUMN place_users_in_place TO place_roles_in_place;
              END IF;
              IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'projects_history'
                  AND column_name = 'subproject_users_in_subproject'
              ) THEN
                ALTER TABLE projects_history RENAME COLUMN subproject_users_in_subproject TO subproject_roles_in_subproject;
              END IF;
              IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'place_levels_history'
                  AND column_name = 'place_users_in_place'
              ) THEN
                ALTER TABLE place_levels_history RENAME COLUMN place_users_in_place TO place_roles_in_place;
              END IF;
            END $$;
            ALTER TABLE IF EXISTS auth_sessions ADD COLUMN IF NOT EXISTS sys_period tstzrange DEFAULT NULL;
            -- charts gained the project-level template flag (2026-09);
            -- heal local databases created before the schema caught up.
            -- charts_history is created via LIKE charts, so it needs the
            -- column too or the versioning trigger breaks on chart updates
            ALTER TABLE IF EXISTS charts ADD COLUMN IF NOT EXISTS for_subprojects boolean NOT NULL DEFAULT FALSE;
            -- reports can point at the design they were created with (2026-09)
            ALTER TABLE IF EXISTS subproject_reports ADD COLUMN IF NOT EXISTS subproject_report_design_id uuid DEFAULT NULL;
            ALTER TABLE IF EXISTS charts_history ADD COLUMN IF NOT EXISTS for_subprojects boolean NOT NULL DEFAULT FALSE;
            -- chart subject tables gained the taxa quantity tables (2026-09);
            -- heal local databases created before the schema caught up.
            -- NB: ADD VALUE has no "IF EXISTS" form for the type itself
            ALTER TYPE chart_subject_table_names_enum ADD VALUE IF NOT EXISTS 'check_taxa' BEFORE 'actions';
            ALTER TYPE chart_subject_table_names_enum ADD VALUE IF NOT EXISTS 'action_taxa' AFTER 'action_quantities';
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
              auth_passkey_id uuid PRIMARY KEY DEFAULT uuidv7(),
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
            ALTER TABLE IF EXISTS layer_presentations ADD COLUMN IF NOT EXISTS project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;
            CREATE INDEX IF NOT EXISTS layer_presentations_project_id_idx ON layer_presentations USING btree(project_id);
            UPDATE layer_presentations SET project_id = wl.project_id FROM wms_layers wl WHERE layer_presentations.wms_layer_id = wl.wms_layer_id AND layer_presentations.project_id IS NULL;
            UPDATE layer_presentations SET project_id = vl.project_id FROM vector_layers vl WHERE layer_presentations.vector_layer_id = vl.vector_layer_id AND layer_presentations.project_id IS NULL;
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
          `

export const SqlInitializer = () => {
  const db = usePGlite()
  const setSqlInitializing = useSetAtom(sqlInitializingAtom)
  const setFirstRunDbInit = useSetAtom(firstRunDbInitAtom)

  useEffect(() => {
    const run = async () => {
      bootTrace('SqlInitializer start')
      try {
        // every sql source this initializer can run, loaded up front: they
        // make up the version stamp
        const [
          healTableViewRenameSql,
          syncIgnoreDuplicateInsertTriggersSql,
          syncReplaceStaleUniqueRowsSql,
          immutableDateSql,
          uuidv7Sql,
          createTablesSql,
          triggersSql,
          repairNestedGeometriesRaw,
        ] = await Promise.all([
          import(`../sql/healFilteredViewsRename.sql?raw`).then(
            (m) => m.default,
          ),
          import(`../sql/syncIgnoreDuplicateInsertTriggers.sql?raw`).then(
            (m) => m.default,
          ),
          import(`../sql/syncReplaceStaleUniqueRows.sql?raw`).then(
            (m) => m.default,
          ),
          import(`../sql/immutableDate.sql?raw`).then((m) => m.default),
          import(`../sql/uuidv7.sql?raw`).then((m) => m.default),
          import(`../sql/createTables.sql?raw`).then((m) => m.default),
          import(`../sql/triggers.sql?raw`).then((m) => m.default),
          // the geometry repair is part of the initialization too: changes
          // to it must re-run the routine
          import(`../modules/repairNestedGeometries.ts?raw`).then(
            (m) => m.default,
          ),
        ])
        const sourcesHash = hashString(
          [
            dedupLayerPresentationsSql,
            healTableViewRenameSql,
            healExistingDbSql,
            syncIgnoreDuplicateInsertTriggersSql,
            syncReplaceStaleUniqueRowsSql,
            immutableDateSql,
            uuidv7Sql,
            createTablesSql,
            triggersSql,
            repairNestedGeometriesRaw,
          ].join('\n;\n'),
        )

        // local-only meta table — never part of any electric sync shape
        await db.exec(
          `CREATE TABLE IF NOT EXISTS _ps_local_meta(key text PRIMARY KEY, value text)`,
        )
        const stampRes = await db.query<{ value: string | null }>(
          `SELECT value FROM _ps_local_meta WHERE key = $1`,
          [SQL_INIT_STAMP_KEY],
        )
        if (stampRes?.rows?.[0]?.value === sourcesHash) {
          bootTrace('SqlInitializer skipped (sql sources unchanged)')
          setSqlInitializing(false)
          return
        }

        // stamp only when every statement succeeded — a partial run must
        // retry on the next load
        let allStatementsSucceeded = true
        const exec = async (sql: string, label: string) => {
          try {
            await db.exec(sql)
          } catch (error) {
            allStatementsSucceeded = false
            console.error(`Error executing ${label}:`, error)
          }
        }
        const stamp = async () => {
          if (!allStatementsSucceeded) return
          try {
            await db.query(
              `INSERT INTO _ps_local_meta(key, value) VALUES ($1, $2)
               ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
              [SQL_INIT_STAMP_KEY, sourcesHash],
            )
          } catch (error) {
            console.error('Error storing sql init stamp:', error)
          }
        }

        const resultProjectsTableExists = await db.query<{ exists: boolean }>(
          `
          SELECT EXISTS (
            SELECT FROM pg_tables
            WHERE  schemaname = 'public'
            AND    tablename  = 'projects'
          )
        `,
        )
        const projectsTableExists = resultProjectsTableExists?.rows?.[0]?.exists

        const resultLayerPresentationsTableExists = await db.query<{
          exists: boolean
        }>(
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

        // remove duplicate layer_presentations per vector_layer_id
        if (layerPresentationsTableExists) {
          await exec(dedupLayerPresentationsSql, 'layer_presentations dedup')
        }

        if (projectsTableExists) {
          // heal existing local databases
          await exec(healTableViewRenameSql, 'healTableViewRenameSql')
          await exec(
            healExistingDbSql,
            'healExistingDbSql (duplicate-guard triggers et al)',
          )
          await exec(
            syncIgnoreDuplicateInsertTriggersSql,
            'syncIgnoreDuplicateInsertTriggersSql',
          )
          await exec(
            syncReplaceStaleUniqueRowsSql,
            'syncReplaceStaleUniqueRowsSql',
          )

          // flatten nested GeometryCollections created by older versions of
          // the draw control — ST_AsGeoJSON fails on them
          try {
            const { repairNestedGeometries } = await import(
              `../modules/repairNestedGeometries.ts`
            )
            await repairNestedGeometries(db)
          } catch (error) {
            allStatementsSucceeded = false
            console.error('Error repairing nested geometries:', error)
          }

          await stamp()
          bootTrace('SqlInitializer done (existing db)')
          setSqlInitializing(false)
          return
        }

        // need to create functions, tables and triggers
        setFirstRunDbInit(true)
        await exec(immutableDateSql, 'immutableDateSql')
        await exec(uuidv7Sql, 'uuidv7Sql')
        await exec(
          `CREATE EXTENSION IF NOT EXISTS postgis;`,
          'postgis extension',
        )
        await exec(
          `CREATE EXTENSION IF NOT EXISTS pg_uuidv7;`,
          'pg_uuidv7 extension',
        )
        await exec(createTablesSql, 'createTables.sql')
        await exec(triggersSql, 'triggers.sql')
        await exec(
          syncIgnoreDuplicateInsertTriggersSql,
          'syncIgnoreDuplicateInsertTriggersSql',
        )
        await exec(
          syncReplaceStaleUniqueRowsSql,
          'syncReplaceStaleUniqueRowsSql',
        )

        await stamp()
        bootTrace('SqlInitializer done')
        setSqlInitializing(false)
      } catch (error) {
        // A rejected query or a failed sql-file import must never leave the
        // app stuck on the "Initializing database" step forever.
        console.error('SqlInitializer failed:', error)
        bootTrace('SqlInitializer FAILED (caught)')
        setSqlInitializing(false)
      }
    }
    run()
  }, [db, setSqlInitializing, setFirstRunDbInit])

  return null
}
