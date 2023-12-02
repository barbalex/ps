CREATE TABLE widget_types(
  widget_type text PRIMARY KEY DEFAULT NULL,
  -- no account_id as field_types are predefined for all projects
  needs_list boolean DEFAULT NULL, -- FALSE,
  sort smallint DEFAULT NULL,
  comment text,
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON widget_types(widget_type);

CREATE INDEX ON widget_types(sort);

-- CREATE INDEX ON widget_types((1))
-- WHERE
--   deleted;
ALTER TABLE widget_types ENABLE electric;

