-- One transaction per file; lock matched rows in UUID order before appending.
CREATE OR REPLACE FUNCTION import_own_geometries(p_table text, p_rows jsonb, p_mode text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  uid uuid := get_jwt_user_id();
  editor text;
  pk text;
  guard text;
  r record;
  previous geometry;
  incoming geometry;
  valid boolean;
  n integer := 0;
BEGIN
  SELECT email INTO editor FROM users WHERE user_id = uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  CASE p_table
    WHEN 'projects' THEN pk := 'project_id'; guard := 'user_can_design_project(t.project_id, $2)';
    WHEN 'places' THEN pk := 'place_id'; guard := 'user_can_write_subproject(coalesce(t.subproject_id, (SELECT p.subproject_id FROM places p WHERE p.place_id=t.parent_id)), $2)';
    WHEN 'actions' THEN pk := 'action_id'; guard := 'user_can_write_place(t.place_id, $2)';
    WHEN 'checks' THEN pk := 'check_id'; guard := 'user_can_write_place(t.place_id, $2)';
    ELSE RAISE EXCEPTION 'Unsupported geometry table';
  END CASE;
  IF p_mode IS NULL OR p_mode NOT IN ('append','replace')
     OR jsonb_typeof(p_rows) IS DISTINCT FROM 'object' OR p_rows = '{}'::jsonb THEN
    RAISE EXCEPTION 'Expected append or replace and geometries keyed by UUID';
  END IF;
  FOR r IN SELECT key::uuid AS id, value AS shapes FROM jsonb_each(p_rows) ORDER BY key::uuid LOOP
    EXECUTE format('SELECT geometry FROM %I t WHERE %I=$1 AND %s FOR UPDATE', p_table, pk, guard)
      INTO previous USING r.id, uid;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN RAISE EXCEPTION 'Missing or non-writable object: %', r.id USING ERRCODE = '42501'; END IF;
    IF jsonb_typeof(r.shapes) IS DISTINCT FROM 'array' OR jsonb_array_length(r.shapes)=0 THEN
      RAISE EXCEPTION 'Expected geometries for %', r.id;
    END IF;
    WITH parts AS MATERIALIZED (
      SELECT ST_Force2D(ST_GeomFromGeoJSON(value)) AS g, ordinality
      FROM jsonb_array_elements(r.shapes) WITH ORDINALITY
    )
    SELECT bool_and(g IS NOT NULL AND NOT ST_IsEmpty(g) AND ST_SRID(g)=4326 AND ST_IsValid(g)
      AND ST_XMin(g)>=-180 AND ST_XMax(g)<=180 AND ST_YMin(g)>=-90 AND ST_YMax(g)<=90),
      ST_Collect(g ORDER BY ordinality) INTO valid, incoming FROM parts;
    IF valid IS NOT TRUE OR (p_table='projects' AND EXISTS (
      SELECT FROM ST_Dump(incoming) d WHERE GeometryType(d.geom) <> 'POLYGON'
    )) THEN RAISE EXCEPTION 'Invalid WGS84 geometry for %: % (projects require polygons)', p_table, r.id; END IF;
    SELECT ST_Collect(d.geom ORDER BY s.ord, d.path) INTO incoming
    FROM (
      SELECT previous AS g, 0 AS ord WHERE p_mode='append' AND previous IS NOT NULL
      UNION ALL SELECT incoming, 1
    ) s CROSS JOIN LATERAL ST_Dump(s.g) d;
    IF p_table = 'projects' THEN
      incoming := ST_Multi(ST_UnaryUnion(incoming));
      UPDATE projects SET geometry=incoming, updated_by=editor WHERE project_id=r.id;
    ELSE
      EXECUTE format('UPDATE %I SET geometry=ST_ForceCollection($1), bbox=jsonb_build_array(ST_XMin($1),ST_YMin($1),ST_XMax($1),ST_YMax($1)), gps_accuracy_m=NULL, updated_by=$2 WHERE %I=$3', p_table, pk)
        USING incoming, editor, r.id;
    END IF;
  END LOOP;
  RETURN (SELECT count(*) FROM jsonb_object_keys(p_rows));
END;
$$;
REVOKE ALL ON FUNCTION import_own_geometries(text,jsonb,text) FROM PUBLIC, web_anon;
GRANT EXECUTE ON FUNCTION import_own_geometries(text,jsonb,text) TO app_user;
NOTIFY pgrst, 'reload schema';
