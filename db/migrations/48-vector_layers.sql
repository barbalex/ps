CREATE TYPE vector_layer_type_enum AS enum(
  'wfs',
  'upload',
  'places1',
  'places2',
  'actions1',
  'actions2',
  'checks1',
  'checks2',
  'observations1',
  'observations2'
);

CREATE TABLE vector_layers(
  vector_layer_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  label text DEFAULT NULL,
  project_id uuid NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  type vector_layer_type_enum DEFAULT NULL, -- 'wfs',
  display_by_property_field text DEFAULT NULL,
  sort smallint DEFAULT NULL,
  active boolean DEFAULT NULL,
  max_zoom integer DEFAULT NULL, -- 19,
  min_zoom integer DEFAULT NULL, -- 0,
  max_features integer DEFAULT NULL, -- 1000
  wfs_url text DEFAULT NULL, -- WFS url, for example https://maps.zh.ch/wfs/OGDZHWFS. TODO: rename wfs_url
  wfs_layer jsonb DEFAULT NULL, -- a single option
  wfs_version text DEFAULT NULL, -- often: 1.1.0 or 2.0.0
  wfs_output_format jsonb DEFAULT NULL, --  a single option. TODO: rename wfs_output_format
  feature_count integer DEFAULT NULL,
  point_count integer DEFAULT NULL,
  line_count integer DEFAULT NULL,
  polygon_count integer DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON vector_layers USING btree(account_id);

CREATE INDEX ON vector_layers USING btree(label);

CREATE INDEX ON vector_layers USING btree(project_id);

CREATE INDEX ON vector_layers USING btree(type);

CREATE INDEX ON vector_layers USING btree(sort);

COMMENT ON TABLE vector_layers IS 'Goal: Bring your own tile layers. Either from wfs or importing GeoJSON. Should only contain metadata, not data fetched from wms or wmts servers (that should only be saved locally on the client).';

COMMENT ON COLUMN vector_layers.display_by_property_field IS 'Name of the field whose values is used to display the layer. If null, a single display is used.';

COMMENT ON COLUMN vector_layers.feature_count IS 'Number of features. Set when downloaded features';

COMMENT ON COLUMN vector_layers.point_count IS 'Number of point features. Used to show styling for points - or not. Set when downloaded features';

COMMENT ON COLUMN vector_layers.line_count IS 'Number of line features. Used to show styling for lines - or not. Set when downloaded features';

COMMENT ON COLUMN vector_layers.polygon_count IS 'Number of polygon features. Used to show styling for polygons - or not. Set when downloaded features';

ALTER TABLE vector_layers ENABLE electric;

