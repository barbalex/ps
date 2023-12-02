CREATE TABLE persons(
  person_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  email text DEFAULT NULL,
  -- data jsonb DEFAULT NULL,
  label text DEFAULT NULL,
  order_by text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON persons USING btree(person_id);

CREATE INDEX ON persons USING btree(account_id);

CREATE INDEX ON persons USING btree(project_id);

CREATE INDEX ON persons USING btree(email);

-- CREATE INDEX ON persons((1))
-- WHERE
--   deleted;
COMMENT ON TABLE persons IS 'Persons are used to assign actions and checks to';

COMMENT ON COLUMN persons.account_id IS 'redundant account_id enhances data safety';

-- COMMENT ON COLUMN persons.data IS 'Room for person specific data, defined in "fields" table';

COMMENT ON COLUMN persons.label IS 'Used to label persons in lists. Contains a field included in the data. Can be a comma separated list of fields. TODO: One or multiple comma separated virtual fields will be added in sqlite and postgresql.';

COMMENT ON COLUMN persons.order_by IS 'Used to order persons in lists. Contains a field included in the data. Can be a comma separated list of fields. TODO: One or multiple comma separated virtual fields will be added and indexed in sqlite and postgresql.';

ALTER TABLE persons ENABLE electric;

