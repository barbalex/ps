CREATE TABLE taxa(
  taxon_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  taxonomy_id uuid DEFAULT NULL REFERENCES taxonomies(taxonomy_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  id_in_source text DEFAULT NULL,
  url text DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON taxa USING btree(taxon_id);
CREATE INDEX ON taxa USING btree(account_id);

CREATE INDEX ON taxa USING btree(taxonomy_id);

CREATE INDEX ON taxa USING btree(name);

CREATE INDEX ON taxa USING btree(label);

-- CREATE INDEX ON taxa((1))
-- WHERE
--   deleted;
COMMENT ON COLUMN taxa.name IS 'Name of taxon, like "Pulsatilla vulgaris"';

COMMENT ON COLUMN taxa.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN taxa.id_in_source IS 'ID of taxon as used in the source taxonomy';

COMMENT ON COLUMN taxa.url IS 'URL of taxon, like "https://www.infoflora.ch/de/flora/pulsatilla-vulgaris.html"';

ALTER TABLE taxa ENABLE electric;

