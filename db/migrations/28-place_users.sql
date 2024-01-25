CREATE TABLE place_users(
  place_user_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  role text DEFAULT NULL,
  -- https://github.com/electric-sql/electric/issues/893
  -- role user_role DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON place_users USING btree(place_user_id);
CREATE INDEX ON place_users USING btree(account_id);

CREATE INDEX ON place_users USING btree(place_id);

CREATE INDEX ON place_users USING btree(user_id);

CREATE INDEX ON place_users USING btree(label);

-- CREATE INDEX ON place_users((1))
-- WHERE
--   deleted;
COMMENT ON TABLE place_users IS 'A way to give users access to places without giving them access to the whole project or subproject.';

COMMENT ON COLUMN place_users.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN place_users.role IS 'TODO: One of: "manager", "editor", "reader". Preset: "reader"';

ALTER TABLE place_users ENABLE electric;

