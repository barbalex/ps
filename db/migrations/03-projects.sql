CREATE TABLE projects(
  project_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  type text DEFAULT NULL,
  subproject_name_singular text DEFAULT NULL,
  subproject_name_plural text DEFAULT NULL,
  subproject_order_by text DEFAULT NULL,
  values_on_multiple_levels text DEFAULT NULL,
  multiple_action_values_on_same_level text DEFAULT NULL,
  multiple_check_values_on_same_level text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  files_active boolean DEFAULT NULL, -- TRUE,
  -- TODO: add files_active for every table that can use files
  -- instead remove that field from those tables
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON projects USING btree(project_id);
CREATE INDEX ON projects USING btree(account_id);

CREATE INDEX ON projects USING btree(name);

-- CREATE INDEX ON projects((1))
-- WHERE
--   deleted;
COMMENT ON COLUMN projects.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN projects.type IS '"species" or "biotope", preset: "species"';

COMMENT ON COLUMN projects.subproject_name_singular IS 'Preset: "Art"';

COMMENT ON COLUMN projects.subproject_name_plural IS 'Preset: "Arten"';

COMMENT ON COLUMN projects.values_on_multiple_levels IS 'One of: "use first", "use second", "use all". Preset: "use first"';

COMMENT ON COLUMN projects.multiple_action_values_on_same_level IS 'One of: "use all", "use last". Preset: "use all"';

COMMENT ON COLUMN projects.multiple_check_values_on_same_level IS 'One of: "use all", "use last". Preset: "use last"';

COMMENT ON COLUMN projects.data IS 'Room for project specific data, defined in "fields" table';

COMMENT ON COLUMN projects.files_active IS 'Whether files are used. Preset: true';

COMMENT ON TABLE projects IS 'Goal: manage projects';

ALTER TABLE projects ENABLE electric;

