CREATE TABLE places(
  place_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  parent_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE NO action ON UPDATE CASCADE,
  level integer DEFAULT NULL, -- 1,
  dat jsonb DEFAULT NULL, -- data provokes errer in electric-sql
  label jsonb DEFAULT NULL,
  order_by jsonb DEFAULT NULL,
  --geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON places USING btree(place_id);

CREATE INDEX ON places USING btree(account_id);

CREATE INDEX ON places USING btree(subproject_id);

CREATE INDEX ON places USING btree(parent_id);

CREATE INDEX ON places USING btree(level);

-- CREATE INDEX ON places USING gin(dat); -- seems not to work with electric-sql
-- CREATE INDEX ON places USING gist(geometry);
-- CREATE INDEX ON places((1))
-- WHERE
--   deleted;
COMMENT ON TABLE places IS 'Places are where actions and checks are done. They can be organized in a hierarchy of one or two levels.';

COMMENT ON COLUMN places.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN places.subproject_id IS 'always set to optimize queries';

COMMENT ON COLUMN places.parent_id IS 'parent place. null for places of level 1';

COMMENT ON COLUMN places.level IS 'level of place: 1, 2';

COMMENT ON COLUMN places.dat IS 'Room for place specific data, defined in "fields" table';

COMMENT ON COLUMN places.label IS 'Used to label places in lists. Contains an array of names of fields included in the data field (first priority) or table itself. TODO: One or multiple comma separated virtual fields will be added in sqlite and postgresql.';

COMMENT ON COLUMN places.order_by IS 'Used to order places in lists. Contains an array of names of fields included in the data field (first priority) or table itself. TODO: One or multiple comma separated virtual fields will be added and indexed in sqlite and postgresql. ';

-- COMMENT ON COLUMN places.geometry IS 'geometry of place';
ALTER TABLE places ENABLE electric;

