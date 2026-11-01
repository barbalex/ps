-- CLIENT ONLY (pglite): not mirrored from backend/db/init.
--
-- When a sync apply inserts a row whose non-primary unique key is already
-- taken by a local row with a DIFFERENT primary key, the local row is
-- stale: pglite-sync ignores Electric's move-out events, so rows that left
-- a subquery shape (e.g. a project's project_users after the project was
-- deleted and re-imported with new ids) linger locally until the next
-- scope reconcile — and the server's replacement row then fails on the
-- unique constraint, aborting the whole apply transaction. The server is
-- authoritative: drop the stale row (cascades take its children along)
-- and let the insert through.
--
-- Not installed on the server: there, direct imports rely on
-- ON CONFLICT (unique key) DO UPDATE to keep existing rows and their ids.

CREATE OR REPLACE FUNCTION sync_replace_stale_unique_rows_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
  con RECORD;
  pk_column TEXT := TG_ARGV[0];
  cols TEXT[];
  predicate TEXT;
BEGIN
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF NOT is_syncing THEN
    RETURN NEW;
  END IF;

  FOR con IN
    SELECT c.conkey
    FROM pg_constraint c
    WHERE c.conrelid = TG_RELID AND c.contype = 'u'
  LOOP
    SELECT array_agg(a.attname::text ORDER BY a.attnum) INTO cols
    FROM pg_attribute a
    WHERE a.attrelid = TG_RELID AND a.attnum = ANY(con.conkey);

    -- nulls never conflict in a unique constraint: plain equality
    SELECT string_agg(format('%I = ($1).%I', c, c), ' AND ') INTO predicate
    FROM unnest(cols) AS c;

    EXECUTE format(
      'DELETE FROM %I.%I WHERE %s AND %I IS DISTINCT FROM ($1).%I',
      TG_TABLE_SCHEMA, TG_TABLE_NAME, predicate, pk_column, pk_column
    ) USING NEW;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t RECORD;
  trigger_name TEXT;
BEGIN
  FOR t IN
    SELECT DISTINCT
      n.nspname AS schema_name,
      c.relname AS table_name,
      a.attname AS pk_column
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_constraint pk ON pk.conrelid = c.oid AND pk.contype = 'p'
    JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = pk.conkey[1]
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND array_length(pk.conkey, 1) = 1
      AND c.relname NOT LIKE '%_history'
      AND EXISTS (
        SELECT 1 FROM pg_constraint u
        WHERE u.conrelid = c.oid AND u.contype = 'u'
      )
      AND NOT EXISTS (
        SELECT 1 FROM pg_depend d
        WHERE d.classid = 'pg_class'::regclass
          AND d.objid = c.oid
          AND d.deptype = 'e'
      )
  LOOP
    trigger_name := t.table_name || '_sync_replace_stale_unique_trigger';
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I ON %I.%I',
      trigger_name, t.schema_name, t.table_name
    );
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE INSERT ON %I.%I FOR EACH ROW EXECUTE PROCEDURE sync_replace_stale_unique_rows_trigger(%L)',
      trigger_name, t.schema_name, t.table_name, t.pk_column
    );
  END LOOP;
END;
$$;
