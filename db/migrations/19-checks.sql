CREATE TABLE checks(
  check_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  date date DEFAULT NULL, -- CURRENT_DATE,
  data jsonb DEFAULT NULL, -- data provokes errer in electric-sql
  -- geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  relevant_for_reports boolean DEFAULT NULL, -- TRUE,
  files_active boolean DEFAULT NULL, -- TRUE,
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON checks USING btree(check_id);

CREATE INDEX ON checks USING btree(account_id);

CREATE INDEX ON checks USING btree(place_id);

CREATE INDEX ON checks USING btree(date);

-- CREATE INDEX ON checks USING gin(data); -- seems not to work with electric-sql
-- CREATE INDEX ON checks USING gist(geometry);
-- CREATE INDEX ON checks((1))
-- WHERE
--   relevant_for_reports;
-- CREATE INDEX ON checks((1))
-- WHERE
--   deleted;
COMMENT ON TABLE checks IS 'Checks describe the situation of the subproject in this place.';

COMMENT ON COLUMN checks.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN checks.data IS 'Room for check specific data, defined in "fields" table';

COMMENT ON COLUMN checks.files_active IS 'Whether files are used. Preset: true';

ALTER TABLE checks ENABLE electric;

