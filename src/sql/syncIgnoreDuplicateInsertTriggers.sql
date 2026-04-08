-- Guard against duplicate INSERT replays during Electric sync.
-- Installs one generic trigger on each public table with a single-column primary key.

CREATE OR REPLACE FUNCTION sync_ignore_duplicate_insert_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
  row_exists BOOLEAN;
BEGIN
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean
  INTO is_syncing;

  IF NOT is_syncing THEN
    RETURN NEW;
  END IF;

  EXECUTE format(
    'SELECT EXISTS (SELECT 1 FROM %I.%I t WHERE t.%I = ($1).%I)',
    TG_TABLE_SCHEMA,
    TG_TABLE_NAME,
    TG_ARGV[0],
    TG_ARGV[0]
  )
  INTO row_exists
  USING NEW;

  IF row_exists THEN
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT
      n.nspname AS schema_name,
      c.relname AS table_name,
      a.attname AS pk_column
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_index i ON i.indrelid = c.oid AND i.indisprimary
    JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = i.indkey[0]
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND array_length(i.indkey, 1) = 1
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS sync_ignore_duplicate_insert_trigger ON %I.%I',
      rec.schema_name,
      rec.table_name
    );

    EXECUTE format(
      'CREATE TRIGGER sync_ignore_duplicate_insert_trigger
       BEFORE INSERT ON %I.%I
       FOR EACH ROW
       EXECUTE PROCEDURE sync_ignore_duplicate_insert_trigger(%L)',
      rec.schema_name,
      rec.table_name,
      rec.pk_column
    );
  END LOOP;
END;
$$;