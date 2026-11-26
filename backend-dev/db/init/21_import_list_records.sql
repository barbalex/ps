-- One request creates one batch under the parent shown in the list. Never
-- take parent IDs, primary keys, permissions or audit fields from file rows.
BEGIN;
DROP FUNCTION IF EXISTS import_list_records(uuid,uuid,uuid,jsonb);
CREATE FUNCTION import_list_records(
  p_project_id uuid, p_subproject_id uuid, p_parent_id uuid, p_rows jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  allowed text[];
  item jsonb;
  ids uuid[];
  result jsonb;
  lvl integer := CASE WHEN p_parent_id IS NULL THEN 1 ELSE 2 END;
  presets jsonb;
BEGIN
  PERFORM 1 FROM projects WHERE project_id = p_project_id
    AND user_can_design_project(project_id, get_jwt_user_id()) FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'A project designer or owner is required to import records' USING ERRCODE = '42501';
  END IF;
  IF p_subproject_id IS NOT NULL THEN
    PERFORM 1 FROM subprojects WHERE subproject_id = p_subproject_id AND project_id = p_project_id FOR SHARE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Subproject is not in this project'; END IF;
  END IF;
  IF p_parent_id IS NOT NULL THEN
    PERFORM 1 FROM places WHERE place_id = p_parent_id AND subproject_id = p_subproject_id
      AND level = 1 AND parent_id IS NULL FOR SHARE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Parent must be a level-one place in this subproject'; END IF;
  END IF;
  IF jsonb_typeof(p_rows) IS DISTINCT FROM 'array' OR jsonb_array_length(p_rows) NOT BETWEEN 1 AND 10000 THEN
    RAISE EXCEPTION 'Expected 1 to 10000 records';
  END IF;
  allowed := CASE WHEN p_subproject_id IS NULL THEN ARRAY['name','start_year','end_year','data']
    ELSE ARRAY['name','since','until','relevant_for_reports','data'] END;
  FOR item IN SELECT value FROM jsonb_array_elements(p_rows) LOOP
    IF jsonb_typeof(item) <> 'object' OR item - allowed <> '{}'::jsonb
       OR item = '{}'::jsonb OR item = '{"data":{}}'::jsonb
       OR (item ? 'data' AND jsonb_typeof(item->'data') <> 'object') THEN
      RAISE EXCEPTION 'Invalid record or unsupported column';
    END IF;
  END LOOP;
  SELECT jsonb_object_agg(name, preset) INTO presets FROM fields
    WHERE project_id = p_project_id AND name IS NOT NULL AND preset IS NOT NULL AND NOT coalesce(obsolete,false)
      AND table_name = CASE WHEN p_subproject_id IS NULL THEN 'subprojects' ELSE 'places' END
      AND (p_subproject_id IS NULL OR level = lvl);
  IF p_subproject_id IS NULL THEN
    WITH inserted AS (INSERT INTO subprojects(project_id, name, start_year, end_year, data)
    SELECT p_project_id, r.name, r.start_year, r.end_year, nullif(coalesce(presets,'{}') || coalesce(r.data,'{}'),'{}')
    FROM jsonb_to_recordset(p_rows) r(name text, start_year integer, end_year integer, data jsonb)
    RETURNING subproject_id) SELECT array_agg(subproject_id) INTO ids FROM inserted;
    SELECT jsonb_agg(to_jsonb(s)) INTO result FROM subprojects s WHERE subproject_id = ANY(ids);
  ELSE
    INSERT INTO vector_layers(project_id, type, own_table, own_table_level, name, max_features)
    SELECT p_project_id, 'own', 'places', lvl, 'places_' || lvl, 1000
    WHERE NOT EXISTS (SELECT FROM vector_layers WHERE project_id = p_project_id AND name = 'places_' || lvl);
    WITH inserted AS (INSERT INTO places(subproject_id, parent_id, level, name, since, until, relevant_for_reports, data)
    SELECT p_subproject_id, p_parent_id, lvl,
      r.name, r.since, r.until, coalesce(r.relevant_for_reports, TRUE), nullif(coalesce(presets,'{}') || coalesce(r.data,'{}'),'{}')
    FROM jsonb_to_recordset(p_rows) r(name text, since integer, until integer, relevant_for_reports boolean, data jsonb)
    RETURNING place_id) SELECT array_agg(place_id) INTO ids FROM inserted;
    -- Read after the statement: the AFTER INSERT trigger computes the place label.
    SELECT jsonb_agg(to_jsonb(p)) INTO result FROM places p WHERE place_id = ANY(ids);
  END IF;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION import_list_records(uuid,uuid,uuid,jsonb) FROM PUBLIC, web_anon;
GRANT EXECUTE ON FUNCTION import_list_records(uuid,uuid,uuid,jsonb) TO app_user;
NOTIFY pgrst, 'reload schema';
COMMIT;
