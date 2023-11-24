CREATE EXTENSION IF NOT EXISTS postgis;

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

---------------------------------------------
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users(
  user_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  -- email needs to be unique
  -- project manager can list project user by email without knowing if this user already exists
  -- then user can create a login (= row in user table) and work in the project
  email text UNIQUE DEFAULT NULL,
  person_id uuid DEFAULT NULL,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE NO action ON UPDATE NO action,
  -- auth_id uuid DEFAULT NULL REFERENCES auth.user (id) ON DELETE NO action ON UPDATE CASCADE,
  auth_id uuid DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON users USING btree(user_id);

CREATE INDEX ON users USING btree(email);

CREATE INDEX ON users USING btree(person_id);

CREATE INDEX ON users USING btree(account_id);

CREATE INDEX ON users USING btree(deleted);

COMMENT ON COLUMN users.email IS 'email needs to be unique. project manager can list project user by email before this user creates an own login (thus has no user_id yet)';

