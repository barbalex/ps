-- 17_syncScope.sql
--
-- sync_scope(): the ids the calling user's Electric shapes are scoped to
-- (see backend/auth/shapeDefinitions.mjs). The sets nest like the shapes:
-- subprojects only within synced projects, places only within synced
-- subprojects.
--
-- The client compares them with its local data and drops rows that left its
-- scope. Needed because pglite-sync does not apply Electric's move-out
-- events: after a role is revoked, the revoked project's rows would stay in
-- the local database until the user clears it.

CREATE OR REPLACE FUNCTION sync_scope()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid := get_jwt_user_id();
  v_project_ids uuid[];
  v_subproject_ids uuid[];
  v_place_ids uuid[];
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'sync_scope requires an authenticated user'
      USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(array_agg(DISTINCT pr.project_id), '{}') INTO v_project_ids
  FROM project_roles pr
  WHERE pr.project_user_id IN (SELECT project_user_id FROM user_project_user_ids(v_user_id));

  SELECT COALESCE(array_agg(DISTINCT s.subproject_id), '{}') INTO v_subproject_ids
  FROM subprojects s
  WHERE s.project_id = ANY(v_project_ids)
    AND s.subproject_id IN (
      SELECT sr.subproject_id FROM subproject_roles sr
      WHERE sr.project_user_id IN (SELECT project_user_id FROM user_project_user_ids(v_user_id))
    );

  SELECT COALESCE(array_agg(DISTINCT p.place_id), '{}') INTO v_place_ids
  FROM places p
  WHERE p.subproject_id = ANY(v_subproject_ids)
    AND p.place_id IN (
      SELECT plr.place_id FROM place_roles plr
      WHERE plr.project_user_id IN (SELECT project_user_id FROM user_project_user_ids(v_user_id))
    );

  RETURN jsonb_build_object(
    'project_ids', to_jsonb(v_project_ids),
    'subproject_ids', to_jsonb(v_subproject_ids),
    'place_ids', to_jsonb(v_place_ids)
  );
END;
$$;

-- exposed at /rpc/sync_scope by PostgREST: authenticated calls only
REVOKE EXECUTE ON FUNCTION sync_scope() FROM PUBLIC, web_anon;
GRANT EXECUTE ON FUNCTION sync_scope() TO app_user;
