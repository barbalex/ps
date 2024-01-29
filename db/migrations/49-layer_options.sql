-- Goal: wms_layer_options can be > 700, slowing down the tileLayer form
-- Solution: outsource them (and maybe later others) here
-- This table is client side only, so we dont need a soft delete column
-- Also: there is no use in saving this data on the server or syncing it
CREATE TYPE layer_options_field_enum AS enum(
  'wms_format_options',
  'wms_layer_options',
  'wms_info_format_options'
);

DROP TABLE IF EXISTS layer_options;

CREATE TABLE layer_options(
  layer_option_id text PRIMARY KEY DEFAULT NULL,
  tile_layer_id uuid DEFAULT NULL REFERENCES tile_layers(tile_layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  vector_layer_id uuid DEFAULT NULL REFERENCES vector_layers(vector_layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  field text DEFAULT NULL,
  value text DEFAULT NULL,
  label text DEFAULT NULL
);

CREATE INDEX ON layer_options USING btree(tile_layer_id);

CREATE INDEX ON layer_options USING btree(vector_layer_id);

CREATE INDEX ON layer_options USING btree(field);

CREATE INDEX ON layer_options USING btree(value);

CREATE INDEX ON layer_options USING btree(label);

COMMENT ON TABLE layer_options IS 'Goal: wms_layer_options can be > 700, slowing down the tileLayer form. Solution: outsource them (and maybe later others) here';

COMMENT ON COLUMN layer_options.layer_option_id IS 'Special text id to make sure we dont have duplicates: built from tile_layer_id, vector_layer_id, field and value. As if it was the datasets url';

ALTER TABLE layer_options ENABLE electric;

