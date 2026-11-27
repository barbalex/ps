-- Also run on existing client databases without rebuilding their local data.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS geometry geometry(MultiPolygon, 4326);
ALTER TABLE IF EXISTS projects_history ADD COLUMN IF NOT EXISTS geometry geometry(MultiPolygon, 4326);
ALTER TABLE IF EXISTS partman.template_public_projects_history ADD COLUMN IF NOT EXISTS geometry geometry(MultiPolygon, 4326);

CREATE OR REPLACE FUNCTION project_area_matches(record_geometry geometry, area geometry, mode text)
RETURNS boolean LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT CASE
    WHEN mode IS NULL OR mode NOT IN ('inside', 'outside') THEN true
    WHEN record_geometry IS NULL OR area IS NULL
      OR ST_IsEmpty(record_geometry) OR ST_IsEmpty(area) THEN false
    WHEN mode = 'inside' THEN ST_CoveredBy(record_geometry, area)
    ELSE NOT ST_CoveredBy(record_geometry, area)
  END
$$;
