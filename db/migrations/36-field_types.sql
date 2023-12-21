CREATE TABLE field_types(
  field_type_id uuid PRIMARY KEY DEFAULT NULL,
  name text DEFAULT NULL,
  -- no account_id as field_types are predefined for all projects
  sort smallint DEFAULT NULL,
  comment text,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL
);

CREATE INDEX ON field_types(name);

CREATE INDEX ON field_types(sort);

-- CREATE INDEX ON field_types((1))
-- WHERE
--   deleted;
ALTER TABLE field_types ENABLE electric;

