CREATE EXTENSION IF NOT EXISTS postgis;

DROP TABLE IF EXISTS public.users CASCADE;


CREATE TABLE users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  name text DEFAULT NULL,
  -- email needs to be unique
  -- project manager can list project users by email without knowing if this user already exists
  -- then user can create a login (= row in users table) and work in the project
  email text UNIQUE DEFAULT NULL,
  account_id uuid DEFAULT NULL,
  -- references accounts (id) on delete no action on update cascade,
  -- auth_user_id uuid DEFAULT NULL REFERENCES auth.users (id) ON DELETE NO action ON UPDATE CASCADE,
  auth_user_id uuid DEFAULT NULL,
  deleted integer DEFAULT 0
);