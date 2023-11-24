CREATE EXTENSION IF NOT EXISTS postgis;

---------------------------------------------
-- accounts
--
DROP TABLE IF EXISTS accounts CASCADE;

CREATE TABLE accounts(
  account_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  type text DEFAULT NULL,
  period daterange DEFAULT NULL
);

-- how to query if date is in range:
-- where period @> '2023-11-01'::date
CREATE INDEX ON accounts USING btree(account_id);

CREATE INDEX ON accounts USING gist(period);

COMMENT ON COLUMN accounts.type IS 'type of account: "free", "basic", "premium"? (TODO: needs to be defined)';

COMMENT ON COLUMN accounts.period IS 'period of account: free: 1 month, basic: 1 year, premium: 1 year (TODO: needs to be defined)';

---------------------------------------------
-- users
--
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users(
  user_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  email text UNIQUE DEFAULT NULL, -- TODO: email needs to be unique
  person_id uuid DEFAULT NULL,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE NO action ON UPDATE NO action,
  auth_id uuid DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON users USING btree(user_id);

CREATE INDEX ON users USING btree(email);

CREATE INDEX ON users USING btree(person_id);

CREATE INDEX ON users USING btree(account_id);

CREATE INDEX ON users USING btree(deleted);

COMMENT ON COLUMN users.email IS 'email needs to be unique. project manager can list project user by email before this user creates an own login (thus has no user_id yet)';

---------------------------------------------
-- projects
--
DROP TABLE IF EXISTS projects CASCADE;

CREATE TABLE projects(
  project_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  name text DEFAULT NULL,
  type text DEFAULT NULL,
  subproject_name_singular text DEFAULT NULL,
  subproject_name_plural text DEFAULT NULL,
  subproject_orderby text DEFAULT NULL,
  values_on_multiple_levels text DEFAULT NULL,
  multiple_action_values_on_same_level text DEFAULT NULL,
  multiple_check_values_on_same_level text DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON projects USING btree(project_id);

CREATE INDEX ON projects USING btree(name);

CREATE INDEX ON projects USING btree(deleted);

