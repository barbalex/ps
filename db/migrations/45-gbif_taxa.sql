CREATE TABLE gbif_taxa(
  gbif_taxon_id uuid PRIMARY KEY DEFAULT NULL,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  gbif_data jsonb DEFAULT NULL,
  label text DEFAULT NULL
);

CREATE INDEX ON gbif_taxa USING btree(gbif_taxon_id);

CREATE INDEX ON gbif_taxa USING btree(account_id);

CREATE INDEX ON gbif_taxa USING btree(project_id);

CREATE INDEX ON gbif_taxa USING btree(label);

COMMENT ON TABLE gbif_taxa IS 'GBIF taxa. Used for species of an area, thus imported from occurrences (format: SPECIES_LIST).';

COMMENT ON COLUMN gbif_taxa.gbif_data IS 'data as received from GBIF';

COMMENT ON COLUMN gbif_taxa.label IS 'label of taxon, used to show it in the UI. Created on import';

ALTER TABLE gbif_taxa ENABLE electric;

