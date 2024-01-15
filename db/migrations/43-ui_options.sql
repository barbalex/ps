CREATE TABLE ui_options(
  user_id uuid PRIMARY KEY DEFAULT NULL,
  designing boolean DEFAULT NULL, -- FALSE,
  breadcrumbs_overflowing boolean DEFAULT NULL, -- FALSE,
  navs_overflowing boolean DEFAULT NULL -- FALSE,
);

-- CREATE INDEX ON ui_options USING btree(user_id);
COMMENT ON TABLE ui_options IS 'User interface settings (state saved in db)';

COMMENT ON COLUMN ui_options.designing IS 'Whether user is currently designing projects. Preset: false';

ALTER TABLE ui_options ENABLE electric;

