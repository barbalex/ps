-- CREATE TYPE user_role AS enum(
--   'manager',
--   'editor',
--   'reader'
-- );

CREATE TABLE project_users(
  project_user_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  role text DEFAULT NULL,
  -- https://github.com/electric-sql/electric/issues/893
  -- role user_role DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON project_users USING btree(project_user_id);
CREATE INDEX ON project_users USING btree(account_id);

CREATE INDEX ON project_users USING btree(project_id);

CREATE INDEX ON project_users USING btree(user_id);

CREATE INDEX ON project_users USING btree(label);

COMMENT ON COLUMN project_users.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN project_users.role IS 'TODO: One of: "manager", "editor", "reader". Preset: "reader"';

COMMENT ON TABLE project_users IS 'A way to give users access to projects (without giving them access to the whole account).';

ALTER TABLE project_users ENABLE electric;

