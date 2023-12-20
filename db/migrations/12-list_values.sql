CREATE TABLE list_values(
  list_value_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  list_id uuid DEFAULT NULL REFERENCES lists(list_id) ON DELETE CASCADE ON UPDATE CASCADE,
  value text DEFAULT NULL,
  obsolete boolean DEFAULT NULL, -- FALSE,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON list_values USING btree(list_value_id);
CREATE INDEX ON list_values USING btree(account_id);

CREATE INDEX ON list_values USING btree(list_id);

CREATE INDEX ON list_values USING btree(value);

-- CREATE INDEX ON list_values((1))
-- WHERE
--   obsolete;
-- CREATE INDEX ON list_values((1))
-- WHERE
--   deleted;
COMMENT ON COLUMN list_values.value IS 'Value of list, like "Gefährdet", "5". If is a number, will have to be coerced to number when used.';

COMMENT ON COLUMN list_values.account_id IS 'redundant account_id enhances data safety';

ALTER TABLE list_values ENABLE electric;

