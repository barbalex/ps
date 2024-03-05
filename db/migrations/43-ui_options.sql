CREATE TABLE ui_options(
  user_id uuid PRIMARY KEY DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  designing boolean DEFAULT NULL, -- FALSE,
  breadcrumbs_overflowing boolean DEFAULT NULL, -- FALSE,
  navs_overflowing boolean DEFAULT NULL, -- FALSE,
  tabs jsonb DEFAULT NULL, -- TODO: jsonb array
  show_map boolean DEFAULT NULL, -- TRUE,
  map_bounds jsonb DEFAULT NULL, -- [minx, miny, maxx, maxy]
  local_map_show jsonb DEFAULT NULL, -- map of id (layer.id, key) and show boolean
  tile_layer_sorter text DEFAULT NULL,
  vector_layer_sorter text DEFAULT NULL,
  editing_place_geometry uuid DEFAULT NULL,
  editing_check_geometry uuid DEFAULT NULL,
  editing_action_geometry uuid DEFAULT NULL,
  label text DEFAULT NULL
);

-- CREATE INDEX ON ui_options USING btree(user_id);
CREATE INDEX ON ui_options USING btree(account_id);

COMMENT ON TABLE ui_options IS 'User interface settings (state saved in db)';

COMMENT ON COLUMN ui_options.designing IS 'Whether user is currently designing projects. Preset: false';

COMMENT ON COLUMN ui_options.editing_place_geometry IS 'The id of the place whose geometry is currently being edited';

COMMENT ON COLUMN ui_options.editing_check_geometry IS 'The id of the check whose geometry is currently being edited';

COMMENT ON COLUMN ui_options.editing_action_geometry IS 'The id of the action whose geometry is currently being edited';

ALTER TABLE ui_options ENABLE electric;

