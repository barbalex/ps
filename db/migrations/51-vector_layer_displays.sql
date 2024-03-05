CREATE TYPE marker_type_enum AS enum(
  'circle',
  'marker'
);

CREATE TYPE line_cap_enum AS enum(
  'butt',
  'round',
  'square'
);

CREATE TYPE vector_layer_table_enum AS enum(
  'places1',
  'places2',
  'actions1',
  'actions2',
  'checks1',
  'checks2',
  'observations1',
  'observations2'
);

-- CREATE TYPE line_join_enum AS enum(
--   'arcs',
--   'bevel',
--   'miter',
--   'miter-clip', // NOT supported by electric-sql
--   'round'
-- );
CREATE TYPE fill_rule_enum AS enum(
  'nonzero',
  'evenodd'
);

DROP TABLE IF EXISTS vector_layer_displays CASCADE;

-- manage all map related properties here? For imported/wfs and also own tables?
CREATE TABLE vector_layer_displays(
  vector_layer_display_id uuid PRIMARY KEY DEFAULT NULL,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  vector_layer_id uuid DEFAULT NULL REFERENCES vector_layers(vector_layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  display_property_value text DEFAULT NULL,
  marker_type marker_type_enum DEFAULT NULL, -- 'circle',
  circle_marker_radius integer DEFAULT NULL, -- 8,
  marker_symbol text DEFAULT NULL,
  marker_size integer DEFAULT NULL, -- 16,
  stroke boolean DEFAULT NULL, -- true,
  color text DEFAULT NULL, -- '#3388ff',
  weight integer DEFAULT NULL, -- 3,
  opacity_percent integer DEFAULT NULL, -- 100,
  line_cap line_cap_enum DEFAULT NULL, -- 'round',
  line_join text DEFAULT NULL, -- 'round',
  dash_array text DEFAULT NULL,
  dash_offset text DEFAULT NULL,
  fill boolean DEFAULT NULL, -- true,
  fill_color text DEFAULT NULL,
  fill_opacity_percent integer DEFAULT NULL, -- 100,
  fill_rule fill_rule_enum DEFAULT NULL, -- 'evenodd',
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- false
);

CREATE INDEX ON vector_layer_displays(account_id);

CREATE INDEX ON vector_layer_displays USING btree(vector_layer_id);

CREATE INDEX ON vector_layer_displays USING btree(display_property_value);

COMMENT ON TABLE vector_layer_displays IS 'Goal: manage all map related properties of vector layers including places, actions, checks and observations';

COMMENT ON COLUMN vector_layer_displays.display_property_value IS 'Enables styling per property value';

COMMENT ON COLUMN vector_layer_displays.marker_symbol IS 'Name of the symbol used for the marker';

COMMENT ON COLUMN vector_layer_displays.marker_size IS 'Size in pixels of the symbol used for the marker. Defaults to 16';

COMMENT ON COLUMN vector_layer_displays.stroke IS 'Whether to draw stroke along the path. Set it to false to disable borders on polygons or circles. https://leafletjs.com/reference.html#path-stroke';

COMMENT ON COLUMN vector_layer_displays.color IS 'Stroke color. https://leafletjs.com/reference.html#path-color';

COMMENT ON COLUMN vector_layer_displays.weight IS 'Stroke width in pixels. https://leafletjs.com/reference.html#path-weight';

COMMENT ON COLUMN vector_layer_displays.opacity_percent IS 'Stroke opacity. https://leafletjs.com/reference.html#path-opacity';

COMMENT ON COLUMN vector_layer_displays.line_cap IS 'A string that defines shape to be used at the end of the stroke. https://leafletjs.com/reference.html#path-linecap. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linecap';

COMMENT ON COLUMN vector_layer_displays.line_join IS 'A string that defines shape to be used at the corners of the stroke. https://leafletjs.com/reference.html#path-linejoin, https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin#usage_context';

COMMENT ON COLUMN vector_layer_displays.dash_array IS 'A string that defines the stroke dash pattern. Doesn''t work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dasharray. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray';

COMMENT ON COLUMN vector_layer_displays.dash_offset IS 'A string that defines the distance into the dash pattern to start the dash. Doesn''t work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dashoffset. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset';

COMMENT ON COLUMN vector_layer_displays.fill IS 'Whether to fill the path with color. Set it to false to disable filling on polygons or circles. https://leafletjs.com/reference.html#path-fill';

COMMENT ON COLUMN vector_layer_displays.fill_color IS 'Fill color. Defaults to the value of the color option. https://leafletjs.com/reference.html#path-fillcolor';

COMMENT ON COLUMN vector_layer_displays.fill_opacity_percent IS 'Fill opacity. https://leafletjs.com/reference.html#path-fillopacity';

COMMENT ON COLUMN vector_layer_displays.fill_rule IS 'A string that defines how the inside of a shape is determined. https://leafletjs.com/reference.html#path-fillrule. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule';

COMMENT ON COLUMN vector_layer_displays.deleted IS 'marks if the row is deleted';

ALTER TABLE vector_layer_displays ENABLE electric;

