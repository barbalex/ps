-- filtered_views -> table_views (2026-11): heal local databases
-- created before the schema caught up.
-- Mirrors the guarded renames in backend/db/init/04_createTables.sql.
-- Applied by SqlInitializer on existing databases (uuidv7() must exist).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'filtered_views'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'table_views'
  ) THEN
    ALTER TABLE filtered_views RENAME TO table_views;
    ALTER TABLE table_views RENAME COLUMN filtered_view_id TO table_view_id;
    ALTER TABLE table_views RENAME CONSTRAINT filtered_views_pkey TO table_views_pkey;
    ALTER INDEX IF EXISTS filtered_views_project_id_idx RENAME TO table_views_project_id_idx;
    ALTER INDEX IF EXISTS filtered_views_table_name_idx RENAME TO table_views_table_name_idx;
    ALTER INDEX IF EXISTS filtered_views_sort_idx RENAME TO table_views_sort_idx;
    ALTER INDEX IF EXISTS filtered_views_label_idx RENAME TO table_views_label_idx;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'place_levels'
      AND column_name = 'filtered_views'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'place_levels'
      AND column_name = 'table_views'
  ) THEN
    ALTER TABLE place_levels RENAME COLUMN filtered_views TO table_views;
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS field_groups(
  field_group_id uuid PRIMARY KEY DEFAULT uuidv7(),
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED,
  table_name text DEFAULT NULL,
  name text DEFAULT NULL,
  -- jsonb, not uuid[]: mirrors the backend schema (temporal_tables cannot
  -- version array-typed columns)
  sorted_field_ids jsonb DEFAULT NULL,
  label text GENERATED ALWAYS AS (coalesce(nullif(name, ''), field_group_id::text)) STORED,
  sys_period tstzrange DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
-- the uuid[] -> jsonb conversion (2026-11): heal local databases created
-- before the schema caught up
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'field_groups'
      AND column_name = 'sorted_field_ids' AND udt_name = '_uuid'
  ) THEN
    ALTER TABLE field_groups
      ALTER COLUMN sorted_field_ids TYPE jsonb USING to_jsonb(sorted_field_ids);
  END IF;
END
$$;
CREATE INDEX IF NOT EXISTS field_groups_project_id_idx ON field_groups USING btree(project_id);
CREATE INDEX IF NOT EXISTS field_groups_table_name_idx ON field_groups USING btree(table_name);
CREATE INDEX IF NOT EXISTS field_groups_label_idx ON field_groups USING btree(label);
ALTER TABLE IF EXISTS table_views ADD COLUMN IF NOT EXISTS field_group_id uuid DEFAULT NULL REFERENCES field_groups(field_group_id) ON DELETE SET NULL ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX IF NOT EXISTS table_views_field_group_id_idx ON table_views USING btree(field_group_id);
