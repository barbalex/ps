-- how to get work:
-- 1. Add label with the following code
-- 2. add column 'label_replace_by_generated_column text DEFAULT NULL' to migration
-- 3. backend:down, backend:start, db:migrate, client:generate
-- 4. load app twice for LabelGenerator to generate generated label
-- 5. replace 'label_replace_by_generated_column' with 'label' in generated code
-- TODO: this fails - error pointing to the spot after the closing bracket
ALTER TABLE accounts
  ADD COLUMN label text GENERATED ALWAYS AS (account_id);

CREATE INDEX IF NOT EXISTS accounts_label_idx ON accounts(label);

ALTER TABLE action_reports
  ADD COLUMN label text GENERATED ALWAYS AS (coalesce(year, action_report_id));

CREATE INDEX IF NOT EXISTS action_reports_label_idx ON action_reports(label);

ALTER TABLE action_report_values
  ADD COLUMN label text GENERATED ALWAYS AS (action_report_value_id);

CREATE INDEX IF NOT EXISTS action_report_values_label_idx ON action_report_values(label);

ALTER TABLE actions
  ADD COLUMN label text GENERATED ALWAYS AS (coalesce(date, action_id));

CREATE INDEX IF NOT EXISTS actions_label_idx ON actions(label);

ALTER TABLE action_values
  ADD COLUMN label text GENERATED ALWAYS AS (action_value_id);

CREATE INDEX IF NOT EXISTS action_values_label_idx ON action_values(label);

ALTER TABLE checks
  ADD COLUMN label text GENERATED ALWAYS AS (coalesce(date, check_id));

CREATE INDEX IF NOT EXISTS checks_label_idx ON checks(label);

ALTER TABLE check_taxa
  ADD COLUMN label text GENERATED ALWAYS AS (check_taxon_id);

CREATE INDEX IF NOT EXISTS check_taxa_label_idx ON check_taxa(label);

ALTER TABLE check_values
  ADD COLUMN label text GENERATED ALWAYS AS (check_value_id);

CREATE INDEX IF NOT EXISTS check_values_label_idx ON check_values(label);

ALTER TABLE fields
  ADD COLUMN label text GENERATED ALWAYS AS (iif(coalesce(table_name, name) IS NOT NULL, table_name || '.' || name, field_id));

CREATE INDEX IF NOT EXISTS fields_label_idx ON fields(label);

ALTER TABLE field_types
  ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, field_type_id));

CREATE INDEX IF NOT EXISTS field_types_label_idx ON field_types(label);

ALTER TABLE files
  ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, file_id));

CREATE INDEX IF NOT EXISTS files_label_idx ON files(label);

ALTER TABLE goal_reports
  ADD COLUMN label text GENERATED ALWAYS AS (goal_report_id);

CREATE INDEX IF NOT EXISTS goal_reports_label_idx ON goal_reports(label);

-- subqueries are not possible in generated columns...
-- sql: `ALTER TABLE goal_report_values ADD COLUMN label text GENERATED ALWAYS AS (iif(coalesce(unit_id, value_integer, value_numeric, value_text) is not null, select label from units u where u.unit_id = unit_id || ':' || coalesce(value_integer, value_numeric, value_text), goal_report_value_id))`
ALTER TABLE goal_report_values
  ADD COLUMN label text GENERATED ALWAYS AS (goal_report_value_id);

CREATE INDEX IF NOT EXISTS goal_report_values_label_idx ON goal_report_values(label);

ALTER TABLE goals
  ADD COLUMN label text GENERATED ALWAYS AS (iif(coalesce(year, name) IS NOT NULL, year || ': ' || name, goal_id));

CREATE INDEX IF NOT EXISTS goals_label_idx ON goals(label);

