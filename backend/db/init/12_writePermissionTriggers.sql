-- 12_writePermissionTriggers.sql
--
-- Server-side write permission enforcement for PostgREST API operations.
--
-- Every INSERT, UPDATE, or DELETE on project-scoped tables via PostgREST is
-- checked against the user's role in project_users / subproject_users / place_users.
--
-- SELECT operations and ElectricSQL sync (electric.syncing = true) are unaffected.
--
-- All triggers use WHEN (pg_trigger_depth() < 1) so that cascade writes coming
-- from other triggers (e.g. owner-setting and role-propagation triggers) bypass
-- this check.
--
-- Role requirement:
--   Data tables ..............  writer, designer, or owner
--   *_users tables ...........  designer or owner
--   projects INSERT ..........  any authenticated user (becomes owner via trigger)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Helper: extract user_id from PostgREST JWT ──────────────────────────────
-- PostgREST v9+ sets request.jwt.claims as the full JSON payload.
-- Individual claim GUCs (request.jwt.claim.<name>) are not guaranteed for
-- custom claim names, so we parse the JSON blob directly.

CREATE OR REPLACE FUNCTION get_jwt_user_id()
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_claims text;
BEGIN
  v_claims := current_setting('request.jwt.claims', true);
  IF v_claims IS NULL OR v_claims = '' THEN
    RETURN NULL;
  END IF;
  RETURN NULLIF(v_claims::jsonb->>'user_id', '')::uuid;
END;
$$;

-- ─── Write-access helpers ─────────────────────────────────────────────────────

-- Returns TRUE when the user has writer+ on the given project directly.
CREATE OR REPLACE FUNCTION user_can_write_project(p_project_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_users
    WHERE project_id = p_project_id
      AND user_id    = p_user_id
      AND role       >= 'writer'::user_roles_enum
  )
$$;

-- Returns TRUE when the user has writer+ on the subproject OR its parent project.
CREATE OR REPLACE FUNCTION user_can_write_subproject(p_subproject_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT user_can_write_project(
    (SELECT project_id FROM subprojects WHERE subproject_id = p_subproject_id),
    p_user_id
  )
  OR EXISTS (
    SELECT 1 FROM subproject_users
    WHERE subproject_id = p_subproject_id
      AND user_id       = p_user_id
      AND role          >= 'writer'::user_roles_enum
  )
$$;

-- Returns TRUE when the user has writer+ on the place, its subproject, or the project.
CREATE OR REPLACE FUNCTION user_can_write_place(p_place_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT user_can_write_subproject(
    (SELECT subproject_id FROM places WHERE place_id = p_place_id),
    p_user_id
  )
  OR EXISTS (
    SELECT 1 FROM place_users
    WHERE place_id = p_place_id
      AND user_id  = p_user_id
      AND role     >= 'writer'::user_roles_enum
  )
$$;

-- ─── Role-management helpers (designer or higher required) ───────────────────

CREATE OR REPLACE FUNCTION user_can_manage_project_roles(p_project_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_users
    WHERE project_id = p_project_id
      AND user_id    = p_user_id
      AND role       >= 'designer'::user_roles_enum
  )
$$;

CREATE OR REPLACE FUNCTION user_can_manage_subproject_roles(p_subproject_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT user_can_manage_project_roles(
    (SELECT project_id FROM subprojects WHERE subproject_id = p_subproject_id),
    p_user_id
  )
  OR EXISTS (
    SELECT 1 FROM subproject_users
    WHERE subproject_id = p_subproject_id
      AND user_id       = p_user_id
      AND role          >= 'designer'::user_roles_enum
  )
$$;

CREATE OR REPLACE FUNCTION user_can_manage_place_roles(p_place_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT user_can_manage_subproject_roles(
    (SELECT subproject_id FROM places WHERE place_id = p_place_id),
    p_user_id
  )
  OR EXISTS (
    SELECT 1 FROM place_users
    WHERE place_id = p_place_id
      AND user_id  = p_user_id
      AND role     >= 'designer'::user_roles_enum
  )
$$;

-- ─── Shared helper: is this an ElectricSQL sync write? ───────────────────────

CREATE OR REPLACE FUNCTION is_electric_sync()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean
$$;

-- ─── Trigger functions ────────────────────────────────────────────────────────

-- For the projects table itself.
-- INSERT: any authenticated user is allowed (the owner trigger makes them owner).
-- UPDATE/DELETE: writer+ on the project required.
CREATE OR REPLACE FUNCTION enforce_projects_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF is_electric_sync() THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  v_user_id := get_jwt_user_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501',
            HINT = 'A valid session is required to modify data';
  END IF;

  -- Any authenticated user may create a project; the insert-owner trigger
  -- immediately adds them as owner.
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  IF NOT user_can_write_project(OLD.project_id, v_user_id) THEN
    RAISE EXCEPTION 'Insufficient permissions: writer or higher role required on this project'
      USING ERRCODE = '42501',
            DETAIL  = format('table=projects operation=%s project_id=%s', TG_OP, OLD.project_id),
            HINT    = 'Contact the project owner to gain write access';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- For tables with a direct project_id FK (excludes projects itself).
CREATE OR REPLACE FUNCTION enforce_project_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id  uuid;
  v_project_id uuid;
BEGIN
  IF is_electric_sync() THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  v_user_id := get_jwt_user_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501',
            HINT = 'A valid session is required to modify data';
  END IF;

  v_project_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.project_id ELSE NEW.project_id END;

  IF v_project_id IS NOT NULL AND NOT user_can_write_project(v_project_id, v_user_id) THEN
    RAISE EXCEPTION 'Insufficient permissions: writer or higher role required on this project'
      USING ERRCODE = '42501',
            DETAIL  = format('table=%s operation=%s project_id=%s', TG_TABLE_NAME, TG_OP, v_project_id),
            HINT    = 'Contact the project owner to gain write access';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- For tables with a direct subproject_id FK (checks subproject AND project).
CREATE OR REPLACE FUNCTION enforce_subproject_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id       uuid;
  v_subproject_id uuid;
BEGIN
  IF is_electric_sync() THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  v_user_id := get_jwt_user_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501',
            HINT = 'A valid session is required to modify data';
  END IF;

  v_subproject_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.subproject_id ELSE NEW.subproject_id END;

  IF v_subproject_id IS NOT NULL AND NOT user_can_write_subproject(v_subproject_id, v_user_id) THEN
    RAISE EXCEPTION 'Insufficient permissions: writer or higher role required on this subproject'
      USING ERRCODE = '42501',
            DETAIL  = format('table=%s operation=%s subproject_id=%s', TG_TABLE_NAME, TG_OP, v_subproject_id),
            HINT    = 'Contact the project owner to gain write access';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- For tables with a direct place_id FK.
CREATE OR REPLACE FUNCTION enforce_place_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
  v_place_id uuid;
BEGIN
  IF is_electric_sync() THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  v_user_id := get_jwt_user_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501',
            HINT = 'A valid session is required to modify data';
  END IF;

  v_place_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.place_id ELSE NEW.place_id END;

  IF v_place_id IS NOT NULL AND NOT user_can_write_place(v_place_id, v_user_id) THEN
    RAISE EXCEPTION 'Insufficient permissions: writer or higher role required on this place'
      USING ERRCODE = '42501',
            DETAIL  = format('table=%s operation=%s place_id=%s', TG_TABLE_NAME, TG_OP, v_place_id),
            HINT    = 'Contact the project owner to gain write access';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- For the places table itself.  Places reference their parent via subproject_id
-- (level 1) or parent_id (level 2, where subproject_id may be inherited).
CREATE OR REPLACE FUNCTION enforce_places_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id       uuid;
  v_subproject_id uuid;
BEGIN
  IF is_electric_sync() THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  v_user_id := get_jwt_user_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501',
            HINT = 'A valid session is required to modify data';
  END IF;

  v_subproject_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.subproject_id ELSE NEW.subproject_id END;

  -- Level 2 places have parent_id set; navigate up to find the subproject.
  IF v_subproject_id IS NULL THEN
    SELECT p.subproject_id INTO v_subproject_id
    FROM places p
    WHERE p.place_id = CASE WHEN TG_OP = 'DELETE' THEN OLD.parent_id ELSE NEW.parent_id END;
  END IF;

  IF v_subproject_id IS NOT NULL AND NOT user_can_write_subproject(v_subproject_id, v_user_id) THEN
    RAISE EXCEPTION 'Insufficient permissions: writer or higher role required on this subproject'
      USING ERRCODE = '42501',
            DETAIL  = format('table=places operation=%s subproject_id=%s', TG_OP, v_subproject_id),
            HINT    = 'Contact the project owner to gain write access';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- For project_users: designer or owner required.
CREATE OR REPLACE FUNCTION enforce_project_users_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id    uuid;
  v_project_id uuid;
BEGIN
  IF is_electric_sync() THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  v_user_id := get_jwt_user_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501',
            HINT = 'A valid session is required to modify data';
  END IF;

  v_project_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.project_id ELSE NEW.project_id END;

  IF TG_OP <> 'DELETE' AND NEW.role = 'owner'::user_roles_enum THEN
    RAISE EXCEPTION 'Only triggers may set the owner role'
      USING ERRCODE = '42501',
            HINT = 'The owner role is assigned automatically when you create a project';
  END IF;

  IF v_project_id IS NOT NULL AND NOT user_can_manage_project_roles(v_project_id, v_user_id) THEN
    RAISE EXCEPTION 'Insufficient permissions: designer or owner role required to manage project members'
      USING ERRCODE = '42501',
            DETAIL  = format('table=project_users operation=%s project_id=%s', TG_OP, v_project_id),
            HINT    = 'Contact the project owner to gain designer access';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- For subproject_users: designer+ on subproject or parent project required.
CREATE OR REPLACE FUNCTION enforce_subproject_users_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id       uuid;
  v_subproject_id uuid;
BEGIN
  IF is_electric_sync() THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  v_user_id := get_jwt_user_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501',
            HINT = 'A valid session is required to modify data';
  END IF;

  v_subproject_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.subproject_id ELSE NEW.subproject_id END;

  IF TG_OP <> 'DELETE' AND NEW.role = 'owner'::user_roles_enum THEN
    RAISE EXCEPTION 'Only triggers may set the owner role'
      USING ERRCODE = '42501',
            HINT = 'The owner role is assigned automatically when you create a project';
  END IF;

  IF v_subproject_id IS NOT NULL
     AND NOT user_can_manage_subproject_roles(v_subproject_id, v_user_id)
  THEN
    RAISE EXCEPTION 'Insufficient permissions: designer or owner role required to manage subproject members'
      USING ERRCODE = '42501',
            DETAIL  = format('table=subproject_users operation=%s subproject_id=%s', TG_OP, v_subproject_id),
            HINT    = 'Contact the project owner to gain designer access';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- For place_users: designer+ on place, subproject, or parent project required.
CREATE OR REPLACE FUNCTION enforce_place_users_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id  uuid;
  v_place_id uuid;
BEGIN
  IF is_electric_sync() THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  v_user_id := get_jwt_user_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501',
            HINT = 'A valid session is required to modify data';
  END IF;

  v_place_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.place_id ELSE NEW.place_id END;

  IF TG_OP <> 'DELETE' AND NEW.role = 'owner'::user_roles_enum THEN
    RAISE EXCEPTION 'Only triggers may set the owner role'
      USING ERRCODE = '42501',
            HINT = 'The owner role is assigned automatically when you create a project';
  END IF;

  IF v_place_id IS NOT NULL AND NOT user_can_manage_place_roles(v_place_id, v_user_id) THEN
    RAISE EXCEPTION 'Insufficient permissions: designer or owner role required to manage place members'
      USING ERRCODE = '42501',
            DETAIL  = format('table=place_users operation=%s place_id=%s', TG_OP, v_place_id),
            HINT    = 'Contact the project owner to gain designer access';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- For tables with multiple nullable level FKs (charts, files, qcs_assignment).
-- Uses the most specific non-null ID: place > subproject > project.
CREATE OR REPLACE FUNCTION enforce_multilevel_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id       uuid;
  v_row           jsonb;
  v_project_id    uuid;
  v_subproject_id uuid;
  v_place_id      uuid;
BEGIN
  IF is_electric_sync() THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  v_user_id := get_jwt_user_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501',
            HINT = 'A valid session is required to modify data';
  END IF;

  v_row           := to_jsonb(CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END);
  v_place_id      := (v_row->>'place_id')::uuid;
  v_subproject_id := (v_row->>'subproject_id')::uuid;
  v_project_id    := (v_row->>'project_id')::uuid;

  IF v_place_id IS NOT NULL THEN
    IF NOT user_can_write_place(v_place_id, v_user_id) THEN
      RAISE EXCEPTION 'Insufficient permissions: writer or higher role required'
        USING ERRCODE = '42501',
              DETAIL  = format('table=%s operation=%s place_id=%s', TG_TABLE_NAME, TG_OP, v_place_id),
              HINT    = 'Contact the project owner to gain write access';
    END IF;
  ELSIF v_subproject_id IS NOT NULL THEN
    IF NOT user_can_write_subproject(v_subproject_id, v_user_id) THEN
      RAISE EXCEPTION 'Insufficient permissions: writer or higher role required'
        USING ERRCODE = '42501',
              DETAIL  = format('table=%s operation=%s subproject_id=%s', TG_TABLE_NAME, TG_OP, v_subproject_id),
              HINT    = 'Contact the project owner to gain write access';
    END IF;
  ELSIF v_project_id IS NOT NULL THEN
    IF NOT user_can_write_project(v_project_id, v_user_id) THEN
      RAISE EXCEPTION 'Insufficient permissions: writer or higher role required'
        USING ERRCODE = '42501',
              DETAIL  = format('table=%s operation=%s project_id=%s', TG_TABLE_NAME, TG_OP, v_project_id),
              HINT    = 'Contact the project owner to gain write access';
    END IF;
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- ─── Attach triggers ──────────────────────────────────────────────────────────
-- All triggers use WHEN (pg_trigger_depth() < 1) to avoid firing during
-- cascaded writes from other triggers (owner-setting, role-propagation, etc.).

-- projects
CREATE OR REPLACE TRIGGER enforce_projects_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_projects_write();

-- project-level tables (direct project_id FK)
CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON place_levels
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON subprojects
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON taxonomies
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON lists
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON units
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON fields
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON field_sorts
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON wms_services
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON wms_layers
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON wfs_services
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON vector_layers
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON project_reports
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON project_report_designs
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON project_report_subdesigns
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON subproject_report_designs
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

CREATE OR REPLACE TRIGGER enforce_project_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON project_crs
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_write();

-- project_users (designer+ required)
CREATE OR REPLACE TRIGGER enforce_project_users_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON project_users
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_project_users_write();

-- subproject-level tables (direct subproject_id FK)
CREATE OR REPLACE TRIGGER enforce_subproject_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON goals
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_subproject_write();

CREATE OR REPLACE TRIGGER enforce_subproject_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON observation_imports
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_subproject_write();

CREATE OR REPLACE TRIGGER enforce_subproject_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON subproject_reports
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_subproject_write();

CREATE OR REPLACE TRIGGER enforce_subproject_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON subproject_taxa
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_subproject_write();

-- subproject_users (designer+ required)
CREATE OR REPLACE TRIGGER enforce_subproject_users_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON subproject_users
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_subproject_users_write();

-- places table (uses subproject_id; navigates parent_id for level 2)
CREATE OR REPLACE TRIGGER enforce_places_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON places
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_places_write();

-- place-level tables (direct place_id FK)
CREATE OR REPLACE TRIGGER enforce_place_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON actions
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_place_write();

CREATE OR REPLACE TRIGGER enforce_place_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON action_reports
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_place_write();

CREATE OR REPLACE TRIGGER enforce_place_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON checks
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_place_write();

CREATE OR REPLACE TRIGGER enforce_place_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON check_reports
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_place_write();

CREATE OR REPLACE TRIGGER enforce_place_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON observations
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_place_write();

-- place_users (designer+ required)
CREATE OR REPLACE TRIGGER enforce_place_users_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON place_users
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_place_users_write();

-- multi-level tables: charts, files, qcs_assignment
-- (have project_id, subproject_id, place_id all nullable;
--  check the most specific non-null one)
CREATE OR REPLACE TRIGGER enforce_multilevel_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON charts
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_multilevel_write();

CREATE OR REPLACE TRIGGER enforce_multilevel_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON files
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_multilevel_write();

CREATE OR REPLACE TRIGGER enforce_multilevel_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON qcs_assignment
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_multilevel_write();
