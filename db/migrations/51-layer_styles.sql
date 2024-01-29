CREATE TYPE marker_type_enum AS enum(
  'circle',
  'marker'
);

CREATE TYPE line_cap_enum AS enum(
  'butt',
  'round',
  'square'
);

CREATE TYPE line_join_enum AS enum(
  'arcs',
  'bevel',
  'miter',
  'miter-clip',
  'round'
);

CREATE TYPE fill_rule_enum AS enum(
  'nonzero',
  'evenodd'
);

DROP TABLE IF EXISTS layer_styles CASCADE;

CREATE TABLE layer_styles(
  layer_style_id uuid PRIMARY KEY DEFAULT NULL, -- gen_random_uuid(),
  vector_layer_id uuid DEFAULT NULL REFERENCES vector_layers(vector_layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  action_id uuid DEFAULT NULL REFERENCES actions(action_id) ON DELETE CASCADE ON UPDATE CASCADE,
  check_id uuid DEFAULT NULL REFERENCES checks(check_id) ON DELETE CASCADE ON UPDATE CASCADE,
  observation_id uuid DEFAULT NULL REFERENCES observations(observation_id) ON DELETE CASCADE ON UPDATE CASCADE, -- really?
  -- TODO: add ids for all tables with geometries
  --table_id uuid UNIQUE DEFAULT NULL REFERENCES tables(id) ON DELETE CASCADE ON UPDATE CASCADE,
  marker_type marker_type_enum DEFAULT NULL, -- 'circle',
  circle_marker_radius integer DEFAULT NULL, -- 8,
  marker_symbol text DEFAULT NULL,
  marker_size integer DEFAULT NULL, -- 16,
  marker_weight integer DEFAULT NULL,
  stroke boolean DEFAULT NULL, -- true,
  color text DEFAULT NULL, -- '#3388ff',
  weight integer DEFAULT NULL, -- 3,
  opacity_percent integer DEFAULT NULL, -- 100,
  line_cap line_cap_enum DEFAULT NULL, -- 'round',
  line_join line_join_enum DEFAULT NULL, -- 'round',
  dash_array text DEFAULT NULL,
  dash_offset text DEFAULT NULL,
  fill boolean DEFAULT NULL, -- true,
  fill_color text DEFAULT NULL,
  fill_opacity_percent integer DEFAULT NULL, -- 100,
  fill_rule fill_rule_enum DEFAULT NULL, -- 'evenodd',
  deleted boolean DEFAULT NULL -- false
);

CREATE INDEX ON layer_styles USING btree(place_id);

CREATE INDEX ON layer_styles USING btree(action_id);

CREATE INDEX ON layer_styles USING btree(check_id);

CREATE INDEX ON layer_styles USING btree(observation_id);

COMMENT ON TABLE layer_styles IS 'Goal: style table layers, project tile layers and project vector layers';

COMMENT ON COLUMN layer_styles.place_id IS 'associated place';

COMMENT ON COLUMN layer_styles.action_id IS 'associated action';

COMMENT ON COLUMN layer_styles.check_id IS 'associated check';

COMMENT ON COLUMN layer_styles.observation_id IS 'associated observation';

COMMENT ON COLUMN layer_styles.marker_symbol IS 'Name of the symbol used for the marker';

COMMENT ON COLUMN layer_styles.marker_size IS 'Size in pixels of the symbol used for the marker. Defaults to 16';

COMMENT ON COLUMN layer_styles.stroke IS 'Whether to draw stroke along the path. Set it to false to disable borders on polygons or circles. https://leafletjs.com/reference.html#path-stroke';

COMMENT ON COLUMN layer_styles.color IS 'Stroke color. https://leafletjs.com/reference.html#path-color';

COMMENT ON COLUMN layer_styles.weight IS 'Stroke width in pixels. https://leafletjs.com/reference.html#path-weight';

COMMENT ON COLUMN layer_styles.opacity_percent IS 'Stroke opacity. https://leafletjs.com/reference.html#path-opacity';

COMMENT ON COLUMN layer_styles.line_cap IS 'A string that defines shape to be used at the end of the stroke. https://leafletjs.com/reference.html#path-linecap. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linecap';

COMMENT ON COLUMN layer_styles.line_join IS 'A string that defines shape to be used at the corners of the stroke. https://leafletjs.com/reference.html#path-linejoin, https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin#usage_context';

COMMENT ON COLUMN layer_styles.dash_array IS 'A string that defines the stroke dash pattern. Doesn''t work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dasharray. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray';

COMMENT ON COLUMN layer_styles.dash_offset IS 'A string that defines the distance into the dash pattern to start the dash. Doesn''t work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dashoffset. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset';

COMMENT ON COLUMN layer_styles.fill IS 'Whether to fill the path with color. Set it to false to disable filling on polygons or circles. https://leafletjs.com/reference.html#path-fill';

COMMENT ON COLUMN layer_styles.fill_color IS 'Fill color. Defaults to the value of the color option. https://leafletjs.com/reference.html#path-fillcolor';

COMMENT ON COLUMN layer_styles.fill_opacity_percent IS 'Fill opacity. https://leafletjs.com/reference.html#path-fillopacity';

COMMENT ON COLUMN layer_styles.fill_rule IS 'A string that defines how the inside of a shape is determined. https://leafletjs.com/reference.html#path-fillrule. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule';

COMMENT ON COLUMN layer_styles.deleted IS 'marks if the row is deleted';

ALTER TABLE layer_options ENABLE electric;

