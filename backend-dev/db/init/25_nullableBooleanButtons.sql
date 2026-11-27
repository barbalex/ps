-- Additive reference data for both new and existing databases.
BEGIN;
SET LOCAL electric.syncing = 'true';
INSERT INTO widget_types (widget_type_id, name, needs_list, sort, comment)
VALUES ('019b0000-0000-7000-8000-000000000003', 'boolean-buttons', FALSE, 15, 'Yes, No or Not assessed')
ON CONFLICT (widget_type_id) DO NOTHING;

INSERT INTO widgets_for_fields (widget_for_field_id, field_type_id, widget_type_id)
SELECT '019b0000-0000-7000-8000-000000000017', field_type_id, '019b0000-0000-7000-8000-000000000003'
FROM field_types WHERE name = 'boolean'
ON CONFLICT (widget_for_field_id) DO NOTHING;
COMMIT;
