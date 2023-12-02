CREATE TABLE field_types(
  field_type text PRIMARY KEY DEFAULT NULL,
  -- no account_id as field_types are predefined for all projects
  sort smallint DEFAULT NULL,
  comment text,
  deleted integer DEFAULT NULL
);

CREATE INDEX ON field_types(field_type);

CREATE INDEX ON field_types(sort);

-- CREATE INDEX ON field_types((1))
-- WHERE
--   deleted;
ALTER TABLE field_types ENABLE electric;

