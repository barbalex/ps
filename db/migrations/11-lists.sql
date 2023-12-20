CREATE TABLE lists(
  list_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  obsolete boolean DEFAULT NULL, -- FALSE,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON lists USING btree(list_id);
CREATE INDEX ON lists USING btree(account_id);

CREATE INDEX ON lists USING btree(project_id);

CREATE INDEX ON lists USING btree(name);

-- CREATE INDEX ON lists((1))
-- WHERE
--   obsolete;
-- CREATE INDEX ON lists((1))
-- WHERE
--   deleted;
COMMENT ON TABLE lists IS 'Manage lists of values. These lists can then be used on option-lists or dropdown-lists';

COMMENT ON COLUMN lists.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN lists.name IS 'Name of list, like "Gefährdung"';

COMMENT ON COLUMN lists.obsolete IS 'Is list obsolete? If so, show set values but dont let user pick one. Preset: false';

ALTER TABLE lists ENABLE electric;

