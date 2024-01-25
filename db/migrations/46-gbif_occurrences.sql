CREATE TABLE gbif_occurrences(
  gbif_occurrence_id uuid PRIMARY KEY DEFAULT NULL,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  gbif_data jsonb DEFAULT NULL,
  label text DEFAULT NULL
);

CREATE INDEX ON gbif_occurrences USING btree(gbif_occurrence_id);

CREATE INDEX ON gbif_occurrences USING btree(account_id);

CREATE INDEX ON gbif_occurrences USING btree(project_id);

CREATE INDEX ON gbif_occurrences USING btree(subproject_id);

CREATE INDEX ON gbif_occurrences USING btree(label);

-- CREATE INDEX ON gbif_occurrences USING gist(gbif_data); TODO: when supported by electric-sql
COMMENT ON TABLE gbif_occurrences IS 'GBIF occurrences. Imported for subprojects (species projects) or projects (biotope projects).';

COMMENT ON COLUMN gbif_occurrences.gbif_data IS 'data as received from GBIF';

COMMENT ON COLUMN gbif_occurrences.label IS 'label of occurrence, used to show it in the UI. Created on import';

ALTER TABLE gbif_occurrences ENABLE electric;

