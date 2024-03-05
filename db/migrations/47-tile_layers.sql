CREATE TYPE tile_layer_type_enum AS enum(
  'wms',
  'wmts'
  -- 'tms'
);

DROP TABLE IF EXISTS tile_layers CASCADE;

CREATE TABLE tile_layers(
  tile_layer_id uuid PRIMARY KEY DEFAULT NULL,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  label text DEFAULT NULL,
  sort smallint DEFAULT NULL, -- 0
  active boolean DEFAULT NULL, -- false
  type tile_layer_type_enum DEFAULT NULL, -- 'wmts'
  wmts_url_template text DEFAULT NULL,
  wmts_subdomains jsonb DEFAULT NULL, -- array of text
  wms_base_url text DEFAULT NULL,
  wms_format jsonb DEFAULT NULL,
  wms_layer jsonb DEFAULT NULL,
  wms_parameters jsonb DEFAULT NULL,
  wms_styles jsonb DEFAULT NULL, -- array of text. TODO: what is this exactly?
  wms_transparent boolean DEFAULT NULL, -- false
  wms_version text DEFAULT NULL, -- values: '1.1.1', '1.3.0'
  wms_info_format jsonb DEFAULT NULL,
  wms_legend jsonb DEFAULT NULL, -- TODO: blob is not yet supported by electric-sql. Change when it is
  max_zoom integer DEFAULT NULL, -- 19
  min_zoom integer DEFAULT NULL, -- 0
  opacity_percent integer DEFAULT NULL, -- 100. TODO: difference to wms_transparent?
  grayscale boolean DEFAULT NULL, -- false
  local_data_size integer DEFAULT NULL,
  local_data_bounds jsonb DEFAULT NULL,
  deleted boolean DEFAULT NULL -- false
);

CREATE INDEX ON tile_layers USING btree(account_id);

CREATE INDEX ON tile_layers USING btree(sort);

COMMENT ON TABLE tile_layers IS 'Goal: Bring your own tile layers. Not versioned (not recorded and only added by manager).';

COMMENT ON COLUMN tile_layers.local_data_size IS 'Size of locally saved image data';

COMMENT ON COLUMN tile_layers.local_data_bounds IS 'Array of bounds and their size of locally saved image data';

COMMENT ON COLUMN tile_layers.opacity_percent IS 'As numeric is not supported by electric-sql, we cant use values between 0 and 1 for opacity. So we use integer values between 0 and 100 and divide by 100 in the frontend.';

ALTER TABLE tile_layers ENABLE electric;

