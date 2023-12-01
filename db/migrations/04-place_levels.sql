CREATE TABLE place_levels(
  place_level_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  level integer DEFAULT NULL,
  name_singular text DEFAULT NULL,
  name_plural text DEFAULT NULL,
  name_short text DEFAULT NULL,
  order_by text DEFAULT NULL,
  reports boolean DEFAULT NULL, -- FALSE,
  report_values boolean DEFAULT NULL, -- FALSE,
  actions boolean DEFAULT NULL, -- FALSE,
  action_values boolean DEFAULT NULL, -- FALSE,
  action_reports boolean DEFAULT NULL, -- FALSE,
  checks boolean DEFAULT NULL, -- FALSE,
  check_values boolean DEFAULT NULL, -- FALSE,
  check_taxons boolean DEFAULT NULL, -- FALSE,
  observation_references boolean DEFAULT NULL, -- FALSE,
  files boolean DEFAULT NULL, -- TRUE,
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON place_levels USING btree(place_level_id);

CREATE INDEX ON place_levels USING btree(account_id);

CREATE INDEX ON place_levels USING btree(project_id);

CREATE INDEX ON place_levels USING btree(level);

CREATE INDEX ON place_levels USING btree(name_singular);

COMMENT ON COLUMN place_levels.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN place_levels.level IS 'level of place: 1, 2';

COMMENT ON COLUMN place_levels.name_singular IS 'Preset: "Population"';

COMMENT ON COLUMN place_levels.name_plural IS 'Preset: "Populationen"';

COMMENT ON COLUMN place_levels.name_short IS 'Preset: "Pop"';

COMMENT ON COLUMN place_levels.order_by IS 'Used to order places. Contains a field included in the data. Can be a comma separated list of fields. TODO: One or multiple comma separated virtual fields will be added and indexed in sqlite and postgresql. Preset: "name_singular". Alternatives: data.[field]';

COMMENT ON COLUMN place_levels.reports IS 'Are reports used? Preset: false';

COMMENT ON COLUMN place_levels.report_values IS 'Are report values used? Preset: false';

COMMENT ON COLUMN place_levels.actions IS 'Are actions used? Preset: false';

COMMENT ON COLUMN place_levels.action_values IS 'Are action values used? Preset: false';

COMMENT ON COLUMN place_levels.action_reports IS 'Are action reports used? Preset: false';

COMMENT ON COLUMN place_levels.checks IS 'Are checks used? Preset: false';

COMMENT ON COLUMN place_levels.check_values IS 'Are check values used? Preset: false';

COMMENT ON COLUMN place_levels.check_taxons IS 'Are check taxons used? Preset: false';

COMMENT ON COLUMN place_levels.observation_references IS 'Are observation references used? Preset: false';

COMMENT ON COLUMN place_levels.files IS 'Whether files are used. Preset: true';

COMMENT ON TABLE place_levels IS 'Goal: manage place levels. Enable working with one or two levels. Organize what features are used on which level.';

ALTER TABLE place_levels ENABLE electric;

