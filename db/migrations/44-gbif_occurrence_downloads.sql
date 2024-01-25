CREATE TYPE gbif_table AS ENUM(
  'gbif_taxa',
  'gbif_occurrences'
);

CREATE TABLE gbif_occurrence_downloads(
  gbif_occurrence_download_id uuid PRIMARY KEY DEFAULT NULL,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  gbif_table gbif_table DEFAULT NULL, -- one of: gbif_taxa, gbif_occurrences
  filters jsonb DEFAULT NULL,
  created_time timestamptz DEFAULT NULL, -- now() not supported yet
  download_key text DEFAULT NULL,
  error text DEFAULT NULL,
  inserted_time timestamptz DEFAULT NULL,
  inserted_count integer DEFAULT NULL,
  attribution text DEFAULT NULL,
  deleted boolean DEFAULT NULL
);

CREATE INDEX ON gbif_occurrence_downloads USING btree(account_id);

CREATE INDEX ON gbif_occurrence_downloads USING btree(project_id);

CREATE INDEX ON gbif_occurrence_downloads USING btree(subproject_id);

CREATE INDEX ON gbif_occurrence_downloads USING btree(created_time);

COMMENT ON TABLE gbif_occurrence_downloads IS 'GBIF occurrence downloads. Used also for species (of an area, format: SPECIES_LIST). Is created in client, synced to server, executed by gbif backend server, written to db and synced back to client';

COMMENT ON COLUMN gbif_occurrence_downloads.filters IS 'area, groups, speciesKeys...';

ALTER TABLE gbif_occurrence_downloads ENABLE electric;

