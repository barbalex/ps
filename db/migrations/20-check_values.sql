CREATE TABLE check_values(
  check_value_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  check_id uuid DEFAULT NULL REFERENCES checks(check_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric double precision DEFAULT NULL,
  value_text text DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON check_values USING btree(check_value_id);
CREATE INDEX ON check_values USING btree(account_id);

CREATE INDEX ON check_values USING btree(check_id);

CREATE INDEX ON check_values USING btree(unit_id);

CREATE INDEX ON check_values USING btree(value_integer);

CREATE INDEX ON check_values USING btree(value_numeric);

CREATE INDEX ON check_values USING btree(value_text);

CREATE INDEX ON check_values USING btree(label);

-- CREATE INDEX ON check_values((1))
-- WHERE
--   deleted;
COMMENT ON TABLE check_values IS 'value-ing checks i.e. the situation of the subproject in this place';

COMMENT ON COLUMN check_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN check_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN check_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN check_values.value_text IS 'Used for text values';

ALTER TABLE check_values ENABLE electric;

