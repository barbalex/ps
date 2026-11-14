-- Error telemetry collector: the opt-in client reporter
-- (src/modules/errorTelemetry.ts) posts one JSON object per client error to
-- the PostgREST API at <constants.getPostgrestUri()>/error_report — enabled
-- in production by setting VITE_ERROR_TELEMETRY=true at build time.
--
-- Privacy model: the payload carries message/stack/url/user-agent/release
-- only — no user identity. Anyone (web_anon) may append a report; only
-- ps_manager may read them (psql as postgres always can). Field caps are
-- enforced by CHECKs and id/created_at are forced server-side, so the
-- endpoint cannot be abused as arbitrary storage.

CREATE TABLE IF NOT EXISTS public.error_report (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  created_at timestamptz NOT NULL DEFAULT now(),
  release text CHECK (char_length(release) <= 40),
  kind text NOT NULL CHECK (
    kind IN ('window.error', 'unhandledrejection', 'boundary', 'manual')
  ),
  message text NOT NULL CHECK (char_length(message) <= 2000),
  stack text CHECK (char_length(stack) <= 5000),
  url text CHECK (char_length(url) <= 2000),
  user_agent text CHECK (char_length(user_agent) <= 1000)
);

-- force id/created_at regardless of what the client sends
CREATE OR REPLACE FUNCTION public.error_report_force_defaults()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.id := uuidv7();
  NEW.created_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS error_report_force_defaults ON public.error_report;
CREATE TRIGGER error_report_force_defaults
  BEFORE INSERT ON public.error_report
  FOR EACH ROW EXECUTE FUNCTION public.error_report_force_defaults();

ALTER TABLE public.error_report ENABLE ROW LEVEL SECURITY;

-- 00_roles.sql grants app_user blanket table privileges via default
-- privileges; error_report is append-only telemetry and the app posts
-- anonymously, so app_user gets nothing here
REVOKE ALL ON public.error_report FROM app_user;

DROP POLICY IF EXISTS insert_anon ON public.error_report;
CREATE POLICY insert_anon ON public.error_report
  FOR INSERT TO web_anon
  WITH CHECK (true);

-- read role for the owner: mint a JWT with {"role": "ps_manager"} signed
-- with PGRST_JWT_SECRET to read reports via PostgREST — or just psql in
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ps_manager') THEN
    CREATE ROLE ps_manager NOLOGIN;
  END IF;
END$$;
GRANT USAGE ON SCHEMA public TO ps_manager;
-- the PostgREST connection user must be a member to switch into the role
GRANT ps_manager TO postgres;

DROP POLICY IF EXISTS read_manager ON public.error_report;
CREATE POLICY read_manager ON public.error_report
  FOR SELECT TO ps_manager
  USING (true);

-- web_anon: insert only — no read/update/delete
GRANT INSERT ON public.error_report TO web_anon;
GRANT SELECT ON public.error_report TO ps_manager;
