-- Reference data only. Can also be applied to an existing database.
BEGIN;
SET LOCAL electric.syncing = 'true';
INSERT INTO widget_types (widget_type_id, name, needs_list, sort, comment) VALUES
  ('019b0000-0000-7000-8000-000000000001', 'multiselect-few', TRUE, 13, 'Multiple choices from a list of checkboxes'),
  ('019b0000-0000-7000-8000-000000000002', 'multiselect-many', TRUE, 14, 'Multiple choices from a searchable list')
ON CONFLICT (widget_type_id) DO NOTHING;

INSERT INTO widgets_for_fields (widget_for_field_id, field_type_id, widget_type_id)
SELECT m.id::uuid, f.field_type_id, w.widget_type_id
FROM (VALUES
  ('019b0000-0000-7000-8000-000000000011', 'text', 'multiselect-few'),
  ('019b0000-0000-7000-8000-000000000012', 'text', 'multiselect-many'),
  ('019b0000-0000-7000-8000-000000000013', 'integer', 'multiselect-few'),
  ('019b0000-0000-7000-8000-000000000014', 'integer', 'multiselect-many'),
  ('019b0000-0000-7000-8000-000000000015', 'decimal', 'multiselect-few'),
  ('019b0000-0000-7000-8000-000000000016', 'decimal', 'multiselect-many')
) AS m(id, field_name, widget_name)
JOIN field_types f ON f.name = m.field_name
JOIN widget_types w ON w.name = m.widget_name
ON CONFLICT (widget_for_field_id) DO NOTHING;
COMMIT;
