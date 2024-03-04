CREATE TYPE chart_type AS enum(
  'Pie',
  'Radar',
  'Area'
);

CREATE TABLE charts(
  chart_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  years_current boolean DEFAULT NULL, -- DATE_PART('year', now()::date),
  years_previous boolean DEFAULT NULL, -- DATE_PART('year', now()::date) - 1,
  years_specific integer DEFAULT NULL,
  years_last_x integer DEFAULT NULL,
  years_since integer DEFAULT NULL, -- DATE_PART('year', now()::date) - DATE_PART('year', start_date),
  years_until integer DEFAULT NULL, -- DATE_PART('year', end_date) - DATE_PART('year', start_date),
  chart_type chart_type DEFAULT NULL, -- 'SimpleLineChart'
  title text DEFAULT NULL,
  subjects_stacked boolean DEFAULT NULL, -- FALSE
  subjects_single boolean DEFAULT NULL, -- FALSE
  percent boolean DEFAULT NULL, -- FALSE
  label_replace_by_generated_column text DEFAULT NULL, -- title
  deleted boolean DEFAULT NULL -- false
);

CREATE INDEX ON charts USING btree(chart_id);

CREATE INDEX ON charts USING btree(account_id);

CREATE INDEX ON charts USING btree(project_id);

CREATE INDEX ON charts USING btree(subproject_id);

CREATE INDEX ON charts USING btree(place_id);

-- CREATE INDEX ON charts((1))
-- WHERE
--   deleted;
COMMENT ON TABLE charts IS 'Charts for projects, subprojects or places.';

COMMENT ON COLUMN charts.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN charts.years_current IS 'If has value: the chart shows data of the current year';

COMMENT ON COLUMN charts.years_previous IS 'If has value: the chart shows data of the previous year';

COMMENT ON COLUMN charts.years_specific IS 'If has value: the chart shows data of the specific year';

COMMENT ON COLUMN charts.years_last_x IS 'If has value: the chart shows data of the last {value} years';

COMMENT ON COLUMN charts.years_since IS 'If has value: the chart shows data since the value specified. Can be the start date of the project, subproject or place';

COMMENT ON COLUMN charts.years_until IS 'If has value: the chart shows data until the value specified. Can be the end date of the project, subproject or place';

ALTER TABLE charts ENABLE electric;

