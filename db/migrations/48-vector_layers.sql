CREATE TYPE vector_layer_type_enum AS enum(
  'wfs',
  'upload'
);

CREATE TABLE vector_layers(
  vector_layer_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  label text DEFAULT NULL,
  sort smallint DEFAULT NULL, -- TODO: move to layer_styles
  active boolean DEFAULT NULL, -- TODO: move to layer_styles
  project_id uuid NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  type vector_layer_type_enum DEFAULT NULL, -- 'wfs',
  url text DEFAULT NULL, -- WFS url, for example https://maps.zh.ch/wfs/OGDZHWFS
  max_zoom integer DEFAULT NULL, -- 19,
  min_zoom integer DEFAULT NULL, -- 0,
  wfs_layer jsonb DEFAULT NULL, -- a single option
  wfs_version text DEFAULT NULL, -- often: 1.1.0 or 2.0.0
  output_format jsonb DEFAULT NULL, --  a single option
  max_features integer DEFAULT NULL, -- 1000,
  feature_count integer DEFAULT NULL, -- TODO: move to layer_styles
  point_count integer DEFAULT NULL,
  line_count integer DEFAULT NULL,
  polygon_count integer DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON vector_layers USING btree(sort);

COMMENT ON TABLE vector_layers IS 'Goal: Bring your own tile layers. Either from wfs or importing GeoJSON. Should only contain metadata, not data fetched from wms or wmts servers (that should only be saved locally on the client).';

COMMENT ON COLUMN vector_layers.max_features IS 'maximum number of features to be loaded into a map';

COMMENT ON COLUMN vector_layers.feature_count IS 'Number of features. Set when downloaded features';

COMMENT ON COLUMN vector_layers.point_count IS 'Number of point features. Used to show styling for points - or not. Set when downloaded features';

COMMENT ON COLUMN vector_layers.line_count IS 'Number of line features. Used to show styling for lines - or not. Set when downloaded features';

COMMENT ON COLUMN vector_layers.polygon_count IS 'Number of polygon features. Used to show styling for polygons - or not. Set when downloaded features';

ALTER TABLE vector_layers ENABLE electric;

