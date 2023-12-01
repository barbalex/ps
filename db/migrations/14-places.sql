CREATE TABLE places(
  place_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  parent_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE NO action ON UPDATE CASCADE,
  level integer DEFAULT null, -- 1,
  --data jsonb DEFAULT NULL,
  --geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON places USING btree(place_id);

CREATE INDEX ON places USING btree(account_id);

CREATE INDEX ON places USING btree(subproject_id);

CREATE INDEX ON places USING btree(parent_id);

CREATE INDEX ON places USING btree(level);

-- CREATE INDEX ON places USING gin(data);
-- CREATE INDEX ON places USING gist(geometry);
-- CREATE INDEX ON places((1))
-- WHERE
--   deleted;
COMMENT ON TABLE places IS 'Places are where actions and checks are done. They can be organized in a hierarchy of one or two levels.';

COMMENT ON COLUMN places.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN places.subproject_id IS 'always set to optimize queries';

COMMENT ON COLUMN places.parent_id IS 'parent place. null for places of level 1';

COMMENT ON COLUMN places.level IS 'level of place: 1, 2';

-- COMMENT ON COLUMN places.data IS 'Room for place specific data, defined in "fields" table';
-- COMMENT ON COLUMN places.geometry IS 'geometry of place';
ALTER TABLE places ENABLE electric;

