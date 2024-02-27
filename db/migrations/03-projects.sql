CREATE TYPE project_type AS enum(
  'species',
  'biotope'
);

CREATE TABLE projects(
  project_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  label text DEFAULT NULL,
  type project_type DEFAULT NULL,
  subproject_name_singular text DEFAULT NULL,
  subproject_name_plural text DEFAULT NULL,
  subproject_order_by text DEFAULT NULL,
  places_label_by text DEFAULT NULL, -- TODO: jsonb array
  places_order_by jsonb DEFAULT NULL, -- TODO: jsonb array
  persons_label_by text DEFAULT NULL, -- TODO: jsonb array
  persons_order_by text DEFAULT NULL, -- TODO: jsonb array
  goal_reports_label_by text DEFAULT NULL, -- TODO: jsonb array
  goal_reports_order_by text DEFAULT NULL, -- TODO: jsonb array
  values_on_multiple_levels text DEFAULT NULL,
  multiple_action_values_on_same_level text DEFAULT NULL,
  multiple_check_values_on_same_level text DEFAULT NULL,
  data jsonb DEFAULT NULL, -- TODO: can not be defined in fields
  files_offline boolean DEFAULT NULL, -- FALSE,
  files_active_projects boolean DEFAULT NULL, -- TRUE,
  files_active_subprojects boolean DEFAULT NULL, -- TRUE,
  files_active_places boolean DEFAULT NULL, -- TRUE,
  files_active_actions boolean DEFAULT NULL, -- TRUE,
  files_active_checks boolean DEFAULT NULL, -- TRUE,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON projects USING btree(project_id);
CREATE INDEX ON projects USING btree(account_id);

CREATE INDEX ON projects USING btree(name);

CREATE INDEX ON projects USING btree(label);

-- CREATE INDEX ON projects((1))
-- WHERE
--   deleted;
COMMENT ON COLUMN projects.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN projects.type IS '"species" or "biotope", preset: "species"';

COMMENT ON COLUMN projects.subproject_name_singular IS 'Preset: "Art"';

COMMENT ON COLUMN projects.subproject_name_plural IS 'Preset: "Arten"';

COMMENT ON COLUMN projects.places_label_by IS 'Used to label places in lists. Contains an array of names of fields included in the data field (first priority) or table itself. TODO: One or multiple comma separated virtual fields will be added in sqlite and postgresql.';

COMMENT ON COLUMN projects.places_order_by IS 'Used to order places in lists. Contains an array of names of fields included in the data field (first priority) or table itself. TODO: One or multiple comma separated virtual fields will be added and indexed in sqlite and postgresql. ';

COMMENT ON COLUMN projects.values_on_multiple_levels IS 'One of: "use first", "use second", "use all". Preset: "use first"';

COMMENT ON COLUMN projects.multiple_action_values_on_same_level IS 'One of: "use all", "use last". Preset: "use all"';

COMMENT ON COLUMN projects.multiple_check_values_on_same_level IS 'One of: "use all", "use last". Preset: "use last"';

COMMENT ON COLUMN projects.data IS 'Room for project specific data, defined in "fields" table';

COMMENT ON COLUMN projects.files_active_projects IS 'Whether files are used in table projects. Preset: true';

COMMENT ON COLUMN projects.files_active_subprojects IS 'Whether files are used in table subprojects. Preset: true';

COMMENT ON COLUMN projects.files_active_places IS 'Whether files are used in table places. Preset: true';

COMMENT ON COLUMN projects.files_active_actions IS 'Whether files are used in table actions. Preset: true';

COMMENT ON COLUMN projects.files_active_checks IS 'Whether files are used in table checks. Preset: true';

COMMENT ON TABLE projects IS 'Goal: manage projects';

ALTER TABLE projects ENABLE electric;

