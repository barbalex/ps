CREATE TYPE vector_layer_type_enum AS enum(
  'wfs',
  'upload'
);

CREATE TABLE vector_layers(
  vector_layer_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  label text DEFAULT NULL,
  sort smallint DEFAULT NULL, -- 0,
  active boolean DEFAULT NULL, -- FALSE,
  project_id uuid NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  type vector_layer_type_enum DEFAULT NULL, -- 'wfs',
  url text DEFAULT NULL, -- WFS url, for example https://maps.zh.ch/wfs/OGDZHWFS
  max_zoom integer DEFAULT NULL, -- 19,
  min_zoom integer DEFAULT NULL, -- 0,
  wfs_layers jsonb DEFAULT NULL, -- for example ms:ogd-0119_giszhpub_feuchtgebietinv_79_90_beob_p
  wfs_version text DEFAULT NULL, -- often: 1.1.0 or 2.0.0
  output_format jsonb DEFAULT NULL, -- need some form of json. TODO: Convert others?
  opacity_percent integer DEFAULT NULL, -- 100,
  max_features integer DEFAULT NULL, -- 1000,
  feature_count integer DEFAULT NULL,
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

COMMENT ON COLUMN vector_layers.opacity_percent IS 'As numeric is not supported by electric-sql, we cant use values between 0 and 1 for opacity. So we use integer values between 0 and 100 and divide by 100 in the frontend.';

ALTER TABLE vector_layers ENABLE electric;

