-- Shared with PGlite for choosing writable map parents. Write enforcement
-- remains server-only (12_writePermissionTriggers.sql).
CREATE OR REPLACE FUNCTION user_project_user_ids(p_user_id uuid)
RETURNS TABLE (project_user_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp AS $$
  SELECT pu.project_user_id
  FROM project_users pu
  WHERE pu.auth_user_id = p_user_id
     OR pu.email = (SELECT u.email FROM users u WHERE u.user_id = p_user_id)
$$;

CREATE OR REPLACE FUNCTION user_can_write_project(p_project_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_roles pr
    WHERE pr.project_id = p_project_id
      AND pr.project_user_id IN (SELECT project_user_id FROM user_project_user_ids(p_user_id))
      AND pr.role >= 'write-all'::user_roles_enum
  )
$$;

CREATE OR REPLACE FUNCTION user_can_write_subproject(p_subproject_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp AS $$
  SELECT user_can_write_project(
    (SELECT project_id FROM subprojects WHERE subproject_id = p_subproject_id),
    p_user_id
  )
  OR EXISTS (
    SELECT 1 FROM subproject_roles sr
    WHERE sr.subproject_id = p_subproject_id
      AND sr.project_user_id IN (SELECT project_user_id FROM user_project_user_ids(p_user_id))
      AND sr.role >= 'write-all'::user_roles_enum
  )
$$;

CREATE OR REPLACE FUNCTION user_can_write_place(p_place_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp AS $$
  SELECT user_can_write_subproject(
    (SELECT subproject_id FROM places WHERE place_id = p_place_id),
    p_user_id
  )
  OR EXISTS (
    SELECT 1 FROM place_roles plr
    WHERE plr.place_id = p_place_id
      AND plr.project_user_id IN (SELECT project_user_id FROM user_project_user_ids(p_user_id))
      AND plr.role >= 'write-all'::user_roles_enum
  )
$$;
