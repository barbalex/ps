CREATE TYPE chart_subject_table AS enum(
  'subprojects',
  'places',
  'checks',
  'check_values',
  'actions',
  'action_values'
);

CREATE TYPE chart_subject_value_source AS enum(
  'count_rows',
  'count_rows_by_distinct_field_values',
  'sum_values_of_field'
);

CREATE TYPE chart_subject_type AS enum(
  'linear',
  'monotone'
);

CREATE TABLE chart_subjects(
  chart_subject_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  chart_id uuid DEFAULT NULL REFERENCES charts(chart_id) ON DELETE CASCADE ON UPDATE CASCADE,
  table_name chart_subject_table DEFAULT NULL, -- subprojects, places, checks, check_values, actions, action_values
  table_level integer DEFAULT NULL, -- 1, 2 (not relevant for subprojects)
  table_filter jsonb DEFAULT NULL, -- save a filter that is applied to the table
  value_source chart_subject_value_source DEFAULT NULL, --how to source the value
  value_field text DEFAULT NULL, -- field to be used for value_source
  value_unit uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE CASCADE ON UPDATE CASCADE, -- needed for action_values, check_values
  name text DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL, -- table, value_source, ?value_field, ?unit
  type chart_subject_type DEFAULT NULL, -- linear, monotone
  stroke text DEFAULT NULL,
  fill text DEFAULT NULL,
  fill_graded boolean DEFAULT NULL, -- TRUE
  connect_nulls boolean DEFAULT NULL, -- TRUE
  sort integer DEFAULT NULL, -- 0
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON chart_subjects USING btree(chart_subject_id);

CREATE INDEX ON chart_subjects USING btree(account_id);

CREATE INDEX ON chart_subjects USING btree(chart_id);

CREATE INDEX ON chart_subjects USING btree(table_name);

CREATE INDEX ON chart_subjects USING btree(table_level);

CREATE INDEX ON chart_subjects USING btree(value_field);

CREATE INDEX ON chart_subjects USING btree(value_unit);

-- CREATE INDEX ON chart_subjects((1))
-- WHERE
--   deleted;
COMMENT ON TABLE chart_subjects IS 'Subjects for charts. Or: what is shown in the chart';

COMMENT ON COLUMN chart_subjects.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN chart_subjects.table_name IS 'The table to be used as data source';

COMMENT ON COLUMN chart_subjects.table_level IS 'The level of the table to be used as data source. 1 or 2 (not relevant for subprojects)';

COMMENT ON COLUMN chart_subjects.table_filter IS 'A filter that is applied to the table';

COMMENT ON COLUMN chart_subjects.value_source IS 'How to source the value';

COMMENT ON COLUMN chart_subjects.value_field IS 'Field to be used for value_source';

COMMENT ON COLUMN chart_subjects.value_unit IS 'Needed for action_values, check_values';

COMMENT ON COLUMN chart_subjects.stroke IS 'Stroke color of the chart';

COMMENT ON COLUMN chart_subjects.fill IS 'Fill color of the chart';

ALTER TABLE chart_subjects ENABLE ELECTRIC;

