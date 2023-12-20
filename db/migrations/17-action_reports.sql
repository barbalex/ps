CREATE TABLE action_reports(
  action_report_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  action_id uuid DEFAULT NULL REFERENCES actions(action_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT NULL, -- DATE_PART('year', now()::date),
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON action_reports USING btree(action_report_id);
CREATE INDEX ON action_reports USING btree(account_id);

CREATE INDEX ON action_reports USING btree(action_id);

CREATE INDEX ON action_reports USING btree(year);

-- CREATE INDEX ON action_reports((1))
-- WHERE
--   deleted;
COMMENT ON TABLE action_reports IS 'Reporting on the success of actions.';

COMMENT ON COLUMN action_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN action_reports.year IS 'Year of report. Preset: current year';

COMMENT ON COLUMN action_reports.data IS 'Room for action report specific data, defined in "fields" table';

ALTER TABLE action_reports ENABLE electric;

