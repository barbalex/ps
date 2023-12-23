CREATE TABLE project_reports(
  project_report_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT NULL, -- DATE_PART('year', now()::date),
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON project_reports USING btree(project_report_id);
CREATE INDEX ON project_reports USING btree(account_id);

CREATE INDEX ON project_reports USING btree(project_id);

CREATE INDEX ON project_reports USING btree(year);

-- CREATE INDEX ON project_reports((1))
-- WHERE
--   deleted;
COMMENT ON TABLE project_reports IS 'Reporting on the success of projects.';

COMMENT ON COLUMN project_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN project_reports.year IS 'Year of report. Preset: current year';

COMMENT ON COLUMN project_reports.data IS 'Room for project report specific data, defined in "fields" table';

ALTER TABLE project_reports ENABLE electric;

