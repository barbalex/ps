-- Ignore duplicate inserts during Electric sync replay for tables that can be
-- legitimately re-delivered with the same primary key.
-- Prevents errors like: duplicate key value violates unique constraint "..._pkey".

CREATE OR REPLACE FUNCTION sync_ignore_duplicate_insert_single_pk_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
  pk_column TEXT;
  pk_value TEXT;
  duplicate_exists BOOLEAN;
BEGIN
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;

  IF NOT is_syncing THEN
    RETURN NEW;
  END IF;

  pk_column := TG_ARGV[0];

  EXECUTE format('SELECT ($1).%I::text', pk_column)
  INTO pk_value
  USING NEW;

  IF pk_value IS NULL THEN
    RETURN NEW;
  END IF;

  EXECUTE format(
    'SELECT EXISTS (SELECT 1 FROM %I.%I WHERE %I::text = $1)',
    TG_TABLE_SCHEMA,
    TG_TABLE_NAME,
    pk_column
  )
  INTO duplicate_exists
  USING pk_value;

  IF duplicate_exists THEN
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  single_pk_table RECORD;
  trigger_name TEXT;
BEGIN
  FOR single_pk_table IN
    SELECT
      n.nspname AS schema_name,
      c.relname AS table_name,
      a.attname AS pk_column
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_constraint con ON con.conrelid = c.oid AND con.contype = 'p'
    JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = con.conkey[1]
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND array_length(con.conkey, 1) = 1
      AND c.relname NOT LIKE '%_history'
      AND NOT EXISTS (
        SELECT 1
        FROM pg_depend d
        WHERE d.classid = 'pg_class'::regclass
          AND d.objid = c.oid
          AND d.deptype = 'e'
      )
  LOOP
    trigger_name := single_pk_table.table_name || '_sync_ignore_duplicate_insert_trigger';

    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I ON %I.%I',
      trigger_name,
      single_pk_table.schema_name,
      single_pk_table.table_name
    );

    EXECUTE format(
      'CREATE TRIGGER %I BEFORE INSERT ON %I.%I FOR EACH ROW EXECUTE PROCEDURE sync_ignore_duplicate_insert_single_pk_trigger(%L)',
      trigger_name,
      single_pk_table.schema_name,
      single_pk_table.table_name,
      single_pk_table.pk_column
    );
  END LOOP;
END;
$$;