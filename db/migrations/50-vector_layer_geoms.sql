DROP TABLE IF EXISTS vector_layer_geoms CASCADE;

--
-- seperate from vector_layers because vector_layers : vector_layer_geoms = 1 : n
-- this way bbox can be used to load only what is in view
CREATE TABLE vector_layer_geoms(
  vector_layer_geom_id uuid PRIMARY KEY DEFAULT NULL,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  vector_layer_id uuid DEFAULT NULL REFERENCES vector_layers(vector_layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  geometry jsonb DEFAULT NULL, -- geometry(GeometryCollection, 4326),
  properties jsonb DEFAULT NULL,
  bbox_sw_lng real DEFAULT NULL,
  bbox_sw_lat real DEFAULT NULL,
  bbox_ne_lng real DEFAULT NULL,
  bbox_ne_lat real DEFAULT NULL,
  deleted boolean DEFAULT NULL -- false
);

CREATE INDEX ON vector_layer_geoms USING btree(account_id);

CREATE INDEX ON vector_layer_geoms USING btree(vector_layer_id);

COMMENT ON TABLE vector_layer_geoms IS 'Goal: Save vector layers client side for 1. offline usage 2. better filtering (to viewport). Data is downloaded when manager configures vector layer. Not versioned (not recorded and only added by manager).';

COMMENT ON COLUMN vector_layer_geoms.geometry IS 'geometry-collection of this row';

COMMENT ON COLUMN vector_layer_geoms.properties IS 'properties of this row';

COMMENT ON COLUMN vector_layer_geoms.bbox_sw_lng IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

COMMENT ON COLUMN vector_layer_geoms.bbox_sw_lat IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

COMMENT ON COLUMN vector_layer_geoms.bbox_ne_lng IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

COMMENT ON COLUMN vector_layer_geoms.bbox_ne_lat IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

ALTER TABLE vector_layer_geoms ENABLE electric;

