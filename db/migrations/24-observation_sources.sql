CREATE TABLE observation_sources(
  observation_source_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  url text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON observation_sources USING btree(observation_source_id);
CREATE INDEX ON observation_sources USING btree(account_id);

CREATE INDEX ON observation_sources USING btree(project_id);

CREATE INDEX ON observation_sources USING btree(name);

-- CREATE INDEX ON observation_sources((1))
-- WHERE
--   deleted;
COMMENT ON TABLE observation_sources IS 'Observation sources are where observations _outside of this project_ come from.';

COMMENT ON COLUMN observation_sources.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN observation_sources.name IS 'Name of observation source, like "GBIF, 1995"';

COMMENT ON COLUMN observation_sources.url IS 'URL of observation source, like "https://www.gbif.org/"';

COMMENT ON COLUMN observation_sources.data IS 'Room for observation source specific data, defined in "fields" table';

ALTER TABLE observation_sources ENABLE electric;

