CREATE TABLE persons(
  person_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  email text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON persons USING btree(person_id);
CREATE INDEX ON persons USING btree(account_id);

CREATE INDEX ON persons USING btree(project_id);

CREATE INDEX ON persons USING btree(email);

-- CREATE INDEX ON persons((1))
-- WHERE
--   deleted;
COMMENT ON TABLE persons IS 'Persons are used to assign actions and checks to';

COMMENT ON COLUMN persons.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN persons.data IS 'Room for person specific data, defined in "fields" table';

ALTER TABLE persons ENABLE electric;

