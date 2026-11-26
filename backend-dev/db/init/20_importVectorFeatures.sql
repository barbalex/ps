-- Geometry and display rows have no project_id of their own. Protect direct
-- PostgREST/queued writes too, including both parents on a move.
CREATE OR REPLACE FUNCTION can_read_vector_layer(p_layer_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT FROM vector_layers vl JOIN project_roles pr USING (project_id)
    WHERE vl.vector_layer_id = p_layer_id AND pr.project_user_id IN
      (SELECT project_user_id FROM user_project_user_ids(get_jwt_user_id()))
  )
$$;
REVOKE ALL ON FUNCTION can_read_vector_layer(uuid) FROM PUBLIC, web_anon;
GRANT EXECUTE ON FUNCTION can_read_vector_layer(uuid) TO app_user;

-- Electric reads as the replication user. For PostgREST's ordinary
-- app_user table access, restrict reads to the same projects as the shape.
ALTER TABLE vector_layer_geoms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vector_layer_member ON vector_layer_geoms;
CREATE POLICY vector_layer_member ON vector_layer_geoms TO app_user
  USING (can_read_vector_layer(vector_layer_id)) WITH CHECK (true);
ALTER TABLE vector_layer_displays ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vector_layer_member ON vector_layer_displays;
CREATE POLICY vector_layer_member ON vector_layer_displays TO app_user
  USING (can_read_vector_layer(vector_layer_id)) WITH CHECK (true);

CREATE OR REPLACE FUNCTION enforce_vector_layer_child_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_layers uuid[];
BEGIN
  IF NOT is_electric_sync() THEN
    v_layers := CASE TG_OP
      WHEN 'INSERT' THEN ARRAY[NEW.vector_layer_id]
      WHEN 'DELETE' THEN ARRAY[OLD.vector_layer_id]
      ELSE ARRAY[OLD.vector_layer_id, NEW.vector_layer_id]
    END;
    IF EXISTS (
      SELECT FROM unnest(v_layers) id
      LEFT JOIN vector_layers vl ON vl.vector_layer_id = id
      WHERE NOT user_can_write_project(vl.project_id, get_jwt_user_id())
    ) THEN
      RAISE EXCEPTION 'Project write permission required' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;
REVOKE ALL ON FUNCTION enforce_vector_layer_child_write() FROM PUBLIC, web_anon, app_user;

CREATE OR REPLACE TRIGGER enforce_vector_layer_child_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON vector_layer_geoms
FOR EACH ROW WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_vector_layer_child_write();

CREATE OR REPLACE TRIGGER enforce_vector_layer_child_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON vector_layer_displays
FOR EACH ROW WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION enforce_vector_layer_child_write();

-- One transaction (including metadata) and one lock per target layer. Do
-- not run as a series of apply_operations: those commit partial successes.
CREATE OR REPLACE FUNCTION import_vector_features(p_layer_id uuid, p_features jsonb, p_mode text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_field text;
  v_properties jsonb;
  v_inserted integer;
BEGIN
  SELECT display_by_property INTO v_field FROM vector_layers
  WHERE vector_layer_id = p_layer_id AND type = 'upload'
    AND user_can_write_project(project_id, get_jwt_user_id())
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'A synced upload layer and project write permission are required' USING ERRCODE = '42501';
  END IF;
  IF p_mode IS NULL OR p_mode NOT IN ('replace', 'append')
    OR jsonb_typeof(p_features) IS DISTINCT FROM 'array' OR jsonb_array_length(p_features) = 0 THEN
    RAISE EXCEPTION 'Expected append or replace and a non-empty feature array' USING ERRCODE = '22023';
  END IF;

  IF p_mode = 'replace' THEN
    DELETE FROM vector_layer_geoms WHERE vector_layer_id = p_layer_id;
  END IF;

  -- ST_Dump recursively flattens nested collections: ST_AsGeoJSON cannot
  -- serialize a nested GeometryCollection. Keep each feature as ONE row.
  INSERT INTO vector_layer_geoms (vector_layer_id, properties, geometry, bbox_sw_lng, bbox_sw_lat, bbox_ne_lng, bbox_ne_lat)
  SELECT p_layer_id, NULLIF(f->'properties', 'null'), geom,
         ST_XMin(geom), ST_YMin(geom), ST_XMax(geom), ST_YMax(geom)
  FROM jsonb_array_elements(p_features) f
  CROSS JOIN LATERAL (
    SELECT ST_ForceCollection(ST_Collect(d.geom ORDER BY d.path)) AS geom
    FROM ST_Dump(ST_Force2D(ST_GeomFromGeoJSON(f->'geometry'))) d
  ) flattened
  WHERE f->>'type' = 'Feature' AND COALESCE(jsonb_typeof(f->'properties'), 'null') IN ('object', 'null')
    AND ST_SRID(geom) = 4326 AND NOT ST_IsEmpty(geom)
    AND ST_XMin(geom) >= -180 AND ST_XMax(geom) <= 180 AND ST_YMin(geom) >= -90 AND ST_YMax(geom) <= 90;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  IF v_inserted <> jsonb_array_length(p_features) THEN
    RAISE EXCEPTION 'Expected non-empty WGS84 GeoJSON features with object or null properties' USING ERRCODE = '22023';
  END IF;

  SELECT COALESCE(jsonb_agg(key ORDER BY key), '[]') INTO v_properties
  FROM (SELECT DISTINCT jsonb_object_keys(properties) AS key FROM vector_layer_geoms WHERE vector_layer_id = p_layer_id) keys;
  IF NOT v_properties ? v_field THEN v_field := NULL; END IF;
  UPDATE vector_layers SET properties = v_properties, display_by_property = v_field,
    (feature_count, point_count, line_count, polygon_count) = (
      SELECT count(*),
             count(*) FILTER (WHERE NOT ST_IsEmpty(ST_CollectionExtract(geometry, 1))),
             count(*) FILTER (WHERE NOT ST_IsEmpty(ST_CollectionExtract(geometry, 2))),
             count(*) FILTER (WHERE NOT ST_IsEmpty(ST_CollectionExtract(geometry, 3)))
      FROM vector_layer_geoms WHERE vector_layer_id = p_layer_id
    )
  WHERE vector_layer_id = p_layer_id;

  -- Preserve every edited style, including the default fallback. Add only
  -- the displays for newly encountered values of the configured field. As
  -- in the property selector, a high-cardinality field does not generate
  -- thousands of styles. Long text/JSON cannot serve as a btree label.
  WITH candidates AS MATERIALIZED (
    SELECT DISTINCT properties->>v_field AS value FROM vector_layer_geoms
    WHERE vector_layer_id = p_layer_id AND v_field IS NOT NULL AND octet_length(properties->>v_field) <= 2000
    LIMIT 31
  )
  INSERT INTO vector_layer_displays (vector_layer_id, display_property_value)
  SELECT p_layer_id, value FROM (
    SELECT NULL::text AS value UNION
    SELECT value FROM candidates WHERE (SELECT count(*) FROM candidates) <= 30
  ) values_to_display
  WHERE NOT EXISTS (SELECT FROM vector_layer_displays d WHERE d.vector_layer_id = p_layer_id AND d.display_property_value IS NOT DISTINCT FROM value);
END;
$$;
REVOKE ALL ON FUNCTION import_vector_features(uuid, jsonb, text) FROM PUBLIC, web_anon;
GRANT EXECUTE ON FUNCTION import_vector_features(uuid, jsonb, text) TO app_user;
NOTIFY pgrst, 'reload schema';
