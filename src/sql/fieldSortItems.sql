-- the order of a table's auto-generated form: its real columns next to its
-- data fields (see sorted_field_ids for the fields alone). For databases
-- created before the column existed; no-op on fresh ones.
ALTER TABLE field_sorts
  ADD COLUMN IF NOT EXISTS sorted_items text[];
