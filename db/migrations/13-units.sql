CREATE TYPE unit_type AS enum(
  'integer',
  'numeric',
  'text'
);

CREATE TABLE units(
  unit_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  use_for_action_values boolean DEFAULT NULL, -- FALSE,
  use_for_action_report_values boolean DEFAULT NULL, -- FALSE,
  use_for_check_values boolean DEFAULT NULL, -- FALSE,
  use_for_place_report_values boolean DEFAULT NULL, -- FALSE,
  use_for_goal_report_values boolean DEFAULT NULL, -- FALSE,
  use_for_subproject_taxa boolean DEFAULT NULL, -- FALSE,
  use_for_check_taxa boolean DEFAULT NULL, -- FALSE,
  name text DEFAULT NULL,
  summable boolean DEFAULT NULL, -- FALSE,
  sort integer DEFAULT NULL,
  type unit_type DEFAULT NULL,
  list_id uuid DEFAULT NULL REFERENCES lists(list_id) ON DELETE NO action ON UPDATE CASCADE,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON units USING btree(unit_id);
CREATE INDEX ON units USING btree(account_id);

CREATE INDEX ON units USING btree(project_id);

CREATE INDEX ON units USING btree(name);

CREATE INDEX ON units USING btree(sort);

CREATE INDEX ON units USING btree(list_id);

-- CREATE INDEX ON units((1))
-- WHERE
--   deleted;
COMMENT ON TABLE units IS 'Manage units of values. These units can then be used for values of actions, checks, reports, goals, taxa';

COMMENT ON COLUMN units.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN units.use_for_action_values IS 'Whether to use this unit for action values. Preset: false';

COMMENT ON COLUMN units.use_for_action_report_values IS 'Whether to use this unit for action report values. Preset: false';

COMMENT ON COLUMN units.use_for_check_values IS 'Whether to use this unit for check values. Preset: false';

COMMENT ON COLUMN units.use_for_place_report_values IS 'Whether to use this unit for place report values. Preset: false';

COMMENT ON COLUMN units.use_for_goal_report_values IS 'Whether to use this unit for goal report values. Preset: false';

COMMENT ON COLUMN units.use_for_subproject_taxa IS 'Whether to use this unit for subproject taxa. Preset: false';

COMMENT ON COLUMN units.use_for_check_taxa IS 'Whether to use this unit for check taxa. Preset: false';

COMMENT ON COLUMN units.name IS 'Name of unit, like "Anzahl"';

COMMENT ON COLUMN units.summable IS 'Whether values of this unit can be summed. Else: distribution of count per value. Preset: false';

COMMENT ON COLUMN units.type IS 'One of: "integer", "numeric", "text". Preset: "integer"';

ALTER TABLE units ENABLE electric;

