-- Goal: wms_layer can be > 700, slowing down the tileLayer form
-- Solution: outsource them (and maybe later others) here
-- This table is client side only, so we dont need a soft delete column
-- Also: there is no use in saving this data on the server or syncing it
CREATE TYPE layer_options_field_enum AS enum(
  'wms_format',
  'wms_layer',
  'wms_info_format',
  'wfs_output_format',
  'wfs_layer'
);

CREATE TABLE layer_options(
  layer_option_id text PRIMARY KEY DEFAULT NULL,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  tile_layer_id uuid DEFAULT NULL REFERENCES tile_layers(tile_layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  vector_layer_id uuid DEFAULT NULL REFERENCES vector_layers(vector_layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  field layer_options_field_enum DEFAULT NULL,
  value text DEFAULT NULL,
  label text DEFAULT NULL,
  queryable boolean DEFAULT NULL,
  legend_url text DEFAULT NULL
);

CREATE INDEX ON layer_options USING btree(account_id);

CREATE INDEX ON layer_options USING btree(tile_layer_id);

CREATE INDEX ON layer_options USING btree(vector_layer_id);

CREATE INDEX ON layer_options USING btree(field);

CREATE INDEX ON layer_options USING btree(value);

CREATE INDEX ON layer_options USING btree(label);

COMMENT ON TABLE layer_options IS 'Goal: wms_layer options can be > 700, slowing down the tileLayer form. Solution: outsource them (and maybe later others) here. Also: there is no use in saving this data on the server or syncing it.';

COMMENT ON COLUMN layer_options.layer_option_id IS 'The base url of the wms server, combined with the field name whose data is stored and the value. Insures that we dont have duplicate entries.';

COMMENT ON COLUMN layer_options.legend_url IS 'The url to fetch the legend image from.';

ALTER TABLE layer_options ENABLE electric;

