CREATE TABLE actions(
  action_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  date date DEFAULT NULL, -- CURRENT_DATE,
  data jsonb DEFAULT NULL, -- data provokes errer in electric-sql
  -- geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  relevant_for_reports boolean DEFAULT NULL, -- TRUE,
  files_active boolean DEFAULT NULL, -- TRUE,
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON actions USING btree(action_id);

CREATE INDEX ON actions USING btree(account_id);

CREATE INDEX ON actions USING btree(place_id);

CREATE INDEX ON actions USING btree(date);

-- CREATE INDEX ON actions USING gin(data); -- seems not to work with electric-sql
-- CREATE INDEX ON actions USING gist(geometry);
-- CREATE INDEX ON actions((1))
-- WHERE
--   relevant_for_reports;
-- CREATE INDEX ON actions((1))
-- WHERE
--   deleted;
COMMENT ON TABLE actions IS 'Actions are what is done to improve the situation of (promote) the subproject in this place.';

COMMENT ON COLUMN actions.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN actions.data IS 'Room for action specific data, defined in "fields" table';

-- COMMENT ON COLUMN actions.geometry IS 'geometry of action';
COMMENT ON COLUMN actions.relevant_for_reports IS 'Whether action is relevant for reports. Preset: true';

COMMENT ON COLUMN actions.files_active IS 'Whether files are used. Preset: true';

ALTER TABLE actions ENABLE electric;

