-- Create PostgreSQL roles for PostgREST access.
-- This file runs first (00_ prefix) so all later init SQL can rely on these roles.

-- web_anon: anonymous role for PostgREST (PGRST_DB_ANON_ROLE).
-- It may reach the API root (used as an online probe) but reads no data:
-- every table read goes through Electric or PostgREST with an app_user JWT.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'web_anon') THEN
    CREATE ROLE web_anon NOLOGIN;
  END IF;
END$$;

GRANT USAGE ON SCHEMA public TO web_anon;
-- REVOKEs make the script converge on databases initialized before the
-- anonymous SELECT grant was dropped
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM web_anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE SELECT ON TABLES FROM web_anon;

-- app_user: authenticated write access.
-- PostgREST switches to this role when a valid JWT containing role='app_user' is presented.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user NOLOGIN;
  END IF;
END$$;

GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- Allow the postgres service account (used by PostgREST) to switch to these roles.
GRANT web_anon TO postgres;
GRANT app_user TO postgres;
