CREATE TABLE ui(
  user_id uuid PRIMARY KEY DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  designing boolean DEFAULT NULL, -- FALSE,
  breadcrumbs_overflowing boolean DEFAULT NULL, -- FALSE,
  navs_overflowing boolean DEFAULT NULL -- FALSE,
);

-- CREATE INDEX ON ui USING btree(user_id);
COMMENT ON TABLE ui IS 'User interface settings (state saved in db)';

COMMENT ON COLUMN ui.designing IS 'Whether user is currently designing projects. Preset: false';

