CREATE TABLE widgets_for_fields(
  widget_for_field_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  field_type_id uuid DEFAULT NULL REFERENCES field_types(field_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  widget_type_id uuid DEFAULT NULL REFERENCES widget_types(widget_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON widgets_for_fields(widget_for_field_id);
CREATE INDEX ON widgets_for_fields(field_type_id);

CREATE INDEX ON widgets_for_fields(widget_type_id);

CREATE INDEX ON widgets_for_fields(label);

-- CREATE INDEX ON widgets_for_fields((1))
-- WHERE
--   deleted;
ALTER TABLE widgets_for_fields ENABLE electric;

