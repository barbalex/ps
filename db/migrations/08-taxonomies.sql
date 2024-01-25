CREATE TYPE taxonomy_type AS enum(
  'species',
  'biotope'
);

CREATE TABLE taxonomies(
  taxonomy_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  type taxonomy_type DEFAULT NULL,
  name text DEFAULT NULL,
  url text DEFAULT NULL,
  obsolete boolean DEFAULT NULL, -- FALSE,
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON taxonomies USING btree(taxonomy_id);
CREATE INDEX ON taxonomies USING btree(account_id);

CREATE INDEX ON taxonomies USING btree(project_id);

CREATE INDEX ON taxonomies USING btree(type);

CREATE INDEX ON taxonomies USING btree(name);

-- CREATE INDEX ON taxonomies((1))
-- WHERE
--   obsolete;
-- CREATE INDEX ON taxonomies((1))
-- WHERE
--   deleted;
COMMENT ON TABLE taxonomies IS 'A taxonomy is a list of taxa (species or biotopes).';

COMMENT ON COLUMN taxonomies.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN taxonomies.type IS 'One of: "species", "biotope". Preset: "species"';

COMMENT ON COLUMN taxonomies.name IS 'Shortish name of taxonomy, like "Flora der Schweiz, 1995"';

COMMENT ON COLUMN taxonomies.url IS 'URL of taxonomy, like "https://www.infoflora.ch/de/flora"';

COMMENT ON COLUMN taxonomies.obsolete IS 'Is taxonomy obsolete? Preset: false';

COMMENT ON COLUMN taxonomies.data IS 'Room for taxonomy specific data, defined in "fields" table';

ALTER TABLE taxonomies ENABLE electric;

