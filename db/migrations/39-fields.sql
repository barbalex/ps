CREATE TABLE fields(
  field_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  tble text DEFAULT NULL,
  field_type_id uuid DEFAULT NULL REFERENCES field_types(field_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  widget_type_id uuid DEFAULT NULL REFERENCES widget_types(widget_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  label text DEFAULT NULL,
  list_id uuid DEFAULT NULL REFERENCES lists(list_id) ON DELETE NO action ON UPDATE CASCADE,
  preset text DEFAULT NULL,
  obsolete boolean DEFAULT NULL, -- FALSE,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON fields USING btree(field_id);
CREATE INDEX ON fields USING btree(project_id);

CREATE INDEX ON fields USING btree(account_id);

CREATE INDEX ON fields USING btree(tble);

CREATE INDEX ON fields USING btree(field_type_id);

CREATE INDEX ON fields USING btree(widget_type_id);

CREATE INDEX ON fields USING btree(label);

CREATE INDEX ON fields USING btree(list_id);

-- CREATE INDEX ON fields USING btree((1))
-- WHERE
--   obsolete;
-- CREATE INDEX ON fields USING btree((1))
-- WHERE
--   deleted;
COMMENT ON TABLE fields IS 'Fields are used to define the data structure of data jsonb fields in other tables.';

COMMENT ON COLUMN fields.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN fields.tble IS 'table, on which this field is used inside the jsob field "data"';

ALTER TABLE fields ENABLE electric;

