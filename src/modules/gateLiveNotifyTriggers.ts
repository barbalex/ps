import type { PGlite } from '@electric-sql/pglite'

type DbWithExec = Pick<PGlite, 'exec'> | { exec: (sql: string) => unknown }

/**
 * Replaces the live extension's per-table notify functions with a
 * syncing-aware body: pg_notify only fires for real user writes, never
 * during Electric sync applies (`electric.syncing` is set per apply
 * transaction).
 *
 * Why: pglite's live extension (<= 0.5.11) creates statement-level notify
 * triggers without an electric.syncing gate. Every apply statement of a
 * large sync or a 409 re-snapshot therefore re-runs every mounted live
 * query — through the same single serialized queue the applies run in,
 * which multiplies sync time and memory. Gating the notify keeps live
 * queries idle until the sync has actually settled.
 *
 * The extension creates these functions lazily when a table gets its first
 * live query, so this needs to run repeatedly (Syncer calls it on an
 * interval); already-gated bodies are simply replaced by identical ones.
 * The generic body derives the channel name from TG_RELID, matching the
 * original `table_change__<schema_oid>__<table_oid>` convention.
 */
export const gateLiveNotifyTriggers = (db: DbWithExec): Promise<unknown> =>
  Promise.resolve(
    db.exec(`
    DO $$
    DECLARE
      r record;
    BEGIN
      FOR r IN
        SELECT n.nspname AS schema_name, p.proname AS fn_name
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE left(p.proname, 8) = '_notify_'
      LOOP
        EXECUTE format(
          'CREATE OR REPLACE FUNCTION %I.%I() RETURNS trigger AS $fn$
             BEGIN
               IF COALESCE(NULLIF(current_setting(''electric.syncing'', true), ''''), ''false'')::boolean THEN
                 RETURN NULL;
               END IF;
               PERFORM pg_notify(
                 ''table_change__'' ||
                 (SELECT relnamespace::text FROM pg_class WHERE oid = TG_RELID) ||
                 ''__'' || TG_RELID::text,
                 ''''
               );
               RETURN NULL;
             END;
           $fn$ LANGUAGE plpgsql',
          r.schema_name,
          r.fn_name
        );
      END LOOP;
    END
    $$;
  `),
  )

/**
 * Fires one pg_notify on every live-notify channel, re-running all mounted
 * live queries once. Called when a sync settles: with the notify functions
 * gated against electric.syncing, queries mounted mid-sync (e.g. after the
 * boot fallback released the UI, or during a 409 re-snapshot) would
 * otherwise keep stale results until the next real write.
 */
export const notifyAllLiveTables = (db: DbWithExec): Promise<unknown> =>
  Promise.resolve(
    db.exec(`
    DO $$
    DECLARE
      r record;
    BEGIN
      FOR r IN
        SELECT split_part(p.proname, '_', 3) AS schema_oid,
          split_part(p.proname, '_', 4) AS table_oid
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE left(p.proname, 8) = '_notify_'
      LOOP
        PERFORM pg_notify('table_change__' || r.schema_oid || '__' || r.table_oid, '');
      END LOOP;
    END
    $$;
  `),
  )
