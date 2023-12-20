CREATE TABLE goals(
  goal_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT NULL, -- DATE_PART('year', now()::date),
  name text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON goals USING btree(goal_id);
CREATE INDEX ON goals USING btree(account_id);

CREATE INDEX ON goals USING btree(subproject_id);

CREATE INDEX ON goals USING btree(year);

-- CREATE INDEX ON goals((1))
-- WHERE
--   deleted;
COMMENT ON TABLE goals IS 'What is to be achieved in the subproject in this year.';

COMMENT ON COLUMN goals.account_id IS 'redundant account_id enhances data safety';

ALTER TABLE goals ENABLE electric;

