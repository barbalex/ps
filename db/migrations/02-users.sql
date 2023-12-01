CREATE TABLE users(
  user_id uuid PRIMARY KEY DEFAULT NULL,
  -- no accout_id as users are app level
  email text DEFAULT NULL, -- TODO: email needs to be unique per account. But: not possible in electric-sql
  auth_id uuid DEFAULT NULL,
  deleted boolean DEFAULT NULL
);

CREATE INDEX ON users USING btree(user_id);

CREATE INDEX ON users USING btree(email);

CREATE INDEX ON users((1))
WHERE
  deleted;

COMMENT ON COLUMN users.email IS 'email needs to be unique. project manager can list project user by email before this user creates an own login (thus has no user_id yet)';

COMMENT ON TABLE users IS 'Goal: manage users and authorize them';

