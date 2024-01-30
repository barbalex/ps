CREATE TABLE ui_options(
  user_id uuid PRIMARY KEY DEFAULT NULL,
  designing boolean DEFAULT NULL, -- FALSE,
  breadcrumbs_overflowing boolean DEFAULT NULL, -- FALSE,
  navs_overflowing boolean DEFAULT NULL, -- FALSE,
  tabs jsonb DEFAULT NULL, -- TODO: jsonb array
  show_map boolean DEFAULT NULL, -- TRUE,
  local_map_show jsonb DEFAULT NULL, -- map of id (layer.id, key) and show boolean
  tile_layer_sorter text DEFAULT NULL,
  vector_layer_sorter text DEFAULT NULL,
  label text DEFAULT NULL
);

-- CREATE INDEX ON ui_options USING btree(user_id);
COMMENT ON TABLE ui_options IS 'User interface settings (state saved in db)';

COMMENT ON COLUMN ui_options.designing IS 'Whether user is currently designing projects. Preset: false';

ALTER TABLE ui_options ENABLE electric;

