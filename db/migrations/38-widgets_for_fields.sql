CREATE TABLE widgets_for_fields(
  widget_for_field_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  field_type text DEFAULT NULL REFERENCES field_types(field_type) ON DELETE CASCADE ON UPDATE CASCADE,
  widget_type text DEFAULT NULL REFERENCES widget_types(widget_type) ON DELETE CASCADE ON UPDATE CASCADE,
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON widgets_for_fields(widget_for_field_id);

CREATE INDEX ON widgets_for_fields(field_type);

CREATE INDEX ON widgets_for_fields(widget_type);

-- CREATE INDEX ON widgets_for_fields((1))
-- WHERE
--   deleted;
ALTER TABLE widgets_for_fields ENABLE electric;

