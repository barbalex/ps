-- 18_hardenFunctionPrivileges.sql
--
-- Closes the anonymous RPC surface on the SECURITY DEFINER permission
-- helpers (pgrls rule SEC042). Functions default to EXECUTE for PUBLIC,
-- so the helpers from 12_writePermissionTriggers.sql were callable at
-- POST /rpc/<function> without a JWT: user_project_user_ids() disclosed
-- any user's project directory rows, and the user_can_* / user_can_manage_*
-- helpers let anonymous callers probe who may write where.
--
-- Nothing legitimate is lost by revoking:
-- - The client only calls sync_scope and apply_operations via RPC; both
--   already restrict EXECUTE to app_user (14_applyOperations.sql,
--   17_syncScope.sql).
-- - Trigger functions check EXECUTE at CREATE TRIGGER time, not at fire
--   time, and SECURITY DEFINER helpers call each other as their owner.
-- - get_jwt_user_id() is the one exception: apply_operations
--   (SECURITY INVOKER, called as app_user) resolves the caller through
--   it, so app_user keeps EXECUTE.
--
-- Also pins search_path on every SECURITY DEFINER helper (pgrls rule
-- SEC015): without a pinned search_path, anyone holding EXECUTE can
-- shadow an unqualified table reference with a pg_temp object and run it
-- with the owner's privileges. 12/17 create these functions with the same
-- SET clause; the ALTERs below converge databases initialized before this
-- file existed. Both places are needed: CREATE OR REPLACE preserves ACLs
-- but drops SET clauses.
--
-- Finally removes EXECUTE from PUBLIC on the remaining functions in
-- public: the pg_jobmon/pg_partman utilities 03_extensions.sql installs
-- here were invocable via /rpc by anonymous requests (they fail on table
-- grants, but the surface should not exist; postgres and partman_user
-- keep their explicit grants), and future functions become private by
-- default instead of PUBLIC-executable.

-- ─── Permission helpers: no anonymous / direct execution ────────────────────

REVOKE EXECUTE ON FUNCTION get_jwt_user_id() FROM PUBLIC, web_anon;
GRANT EXECUTE ON FUNCTION get_jwt_user_id() TO app_user;

REVOKE EXECUTE ON FUNCTION user_project_user_ids(p_user_id uuid) FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION user_can_write_project(p_project_id uuid, p_user_id uuid) FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION user_can_write_subproject(p_subproject_id uuid, p_user_id uuid) FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION user_can_write_place(p_place_id uuid, p_user_id uuid) FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION user_can_manage_project_roles(p_project_id uuid, p_user_id uuid) FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION user_can_manage_subproject_roles(p_subproject_id uuid, p_user_id uuid) FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION user_can_manage_place_roles(p_place_id uuid, p_user_id uuid) FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION enforce_projects_write() FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION enforce_project_write() FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION enforce_subproject_write() FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION enforce_place_write() FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION enforce_places_write() FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION enforce_project_users_write() FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION enforce_project_roles_write() FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION enforce_subproject_roles_write() FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION enforce_place_roles_write() FROM PUBLIC, web_anon;
REVOKE EXECUTE ON FUNCTION enforce_multilevel_write() FROM PUBLIC, web_anon;

-- ─── SECURITY DEFINER helpers: pin search_path (SEC015) ─────────────────────
-- no-op where 12/17 already created the function with the same SET clause

ALTER FUNCTION get_jwt_user_id() SET search_path = public, pg_temp;
ALTER FUNCTION user_project_user_ids(p_user_id uuid) SET search_path = public, pg_temp;
ALTER FUNCTION user_can_write_project(p_project_id uuid, p_user_id uuid) SET search_path = public, pg_temp;
ALTER FUNCTION user_can_write_subproject(p_subproject_id uuid, p_user_id uuid) SET search_path = public, pg_temp;
ALTER FUNCTION user_can_write_place(p_place_id uuid, p_user_id uuid) SET search_path = public, pg_temp;
ALTER FUNCTION user_can_manage_project_roles(p_project_id uuid, p_user_id uuid) SET search_path = public, pg_temp;
ALTER FUNCTION user_can_manage_subproject_roles(p_subproject_id uuid, p_user_id uuid) SET search_path = public, pg_temp;
ALTER FUNCTION user_can_manage_place_roles(p_place_id uuid, p_user_id uuid) SET search_path = public, pg_temp;
ALTER FUNCTION enforce_projects_write() SET search_path = public, pg_temp;
ALTER FUNCTION enforce_project_write() SET search_path = public, pg_temp;
ALTER FUNCTION enforce_subproject_write() SET search_path = public, pg_temp;
ALTER FUNCTION enforce_place_write() SET search_path = public, pg_temp;
ALTER FUNCTION enforce_places_write() SET search_path = public, pg_temp;
ALTER FUNCTION enforce_project_users_write() SET search_path = public, pg_temp;
ALTER FUNCTION enforce_project_roles_write() SET search_path = public, pg_temp;
ALTER FUNCTION enforce_subproject_roles_write() SET search_path = public, pg_temp;
ALTER FUNCTION enforce_place_roles_write() SET search_path = public, pg_temp;
ALTER FUNCTION enforce_multilevel_write() SET search_path = public, pg_temp;
ALTER FUNCTION sync_scope() SET search_path = public, pg_temp;

-- ─── Remaining PUBLIC grants: pg_jobmon/pg_partman utilities ────────────────
-- covers functions with an explicit PUBLIC entry in proacl and functions
-- with NULL proacl (whose default is also PUBLIC)

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT format('%I(%s)', p.proname, pg_get_function_identity_arguments(p.oid)) AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND EXISTS (
        SELECT FROM aclexplode(COALESCE(p.proacl, acldefault('FUNCTION', p.proowner)))
        WHERE grantee = 0
      )
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC', r.signature);
  END LOOP;
END$$;

-- ─── Future functions: private by default ───────────────────────────────────

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- refresh PostgREST's schema cache so the closed RPC endpoints disappear
-- from its function registry immediately (GRANT/REVOKE emit no DDL event)
NOTIFY pgrst, 'reload schema';
