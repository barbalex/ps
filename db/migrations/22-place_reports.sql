CREATE TABLE place_reports(
  place_report_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT NULL, -- DATE_PART('year', now()::date),
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON place_reports USING btree(place_report_id);
CREATE INDEX ON place_reports USING btree(account_id);

CREATE INDEX ON place_reports USING btree(place_id);

CREATE INDEX ON place_reports USING btree(year);

-- CREATE INDEX ON place_reports((1))
-- WHERE
--   deleted;
COMMENT ON TABLE place_reports IS 'Reporting on the situation of the subproject in this place.';

COMMENT ON COLUMN place_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN place_reports.year IS 'Year of report. Preset: current year';

COMMENT ON COLUMN place_reports.data IS 'Room for place report specific data, defined in "fields" table';

ALTER TABLE place_reports ENABLE electric;

