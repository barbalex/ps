CREATE TABLE goal_reports(
  goal_report_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  goal_id uuid DEFAULT NULL REFERENCES goals(goal_id) ON DELETE CASCADE ON UPDATE CASCADE,
  data jsonb DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON goal_reports USING btree(goal_report_id);
CREATE INDEX ON goal_reports USING btree(account_id);

CREATE INDEX ON goal_reports USING btree(goal_id);

CREATE INDEX ON goal_reports USING btree(label);

-- CREATE INDEX ON goal_reports((1))
-- WHERE
--   deleted;
COMMENT ON TABLE goal_reports IS 'Reporting on the success of goals.';

COMMENT ON COLUMN goal_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN goal_reports.data IS 'Room for goal report specific data, defined in "fields" table';

ALTER TABLE goal_reports ENABLE electric;

