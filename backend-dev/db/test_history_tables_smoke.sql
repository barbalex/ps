-- Smoke test for temporal history/partition setup across additional form-backed tables.
--
-- What it checks:
-- 1) Versioning triggers write rows to *_history on UPDATE/DELETE.
-- 2) New form-table history parents are registered in pg_partman.
--
-- This script leaves committed history rows behind but removes the current live rows.

CREATE TEMP TABLE history_test_ids (
	user_id uuid,
	account_id uuid,
	list_id uuid,
	field_type_id uuid,
	message_id uuid,
	qcs_id uuid
);

BEGIN;

DO $$
DECLARE
	v_user_id uuid;
	v_account_id uuid;
	v_list_id uuid;
	v_field_type_id uuid;
	v_message_id uuid;
	v_qcs_id uuid;
	v_suffix text;
BEGIN
	v_suffix := replace(uuid_generate_v7()::text, '-', '');

	INSERT INTO users (name, email)
	VALUES (
		'Temporal smoke user ' || left(v_suffix, 8),
		'history-smoke-' || left(v_suffix, 16) || '@example.test'
	)
	RETURNING user_id INTO v_user_id;

	INSERT INTO accounts (user_id, label)
	VALUES (v_user_id, 'Temporal smoke account ' || left(v_suffix, 8))
	RETURNING account_id INTO v_account_id;

	INSERT INTO lists (name)
	VALUES ('Temporal smoke list ' || left(v_suffix, 8))
	RETURNING list_id INTO v_list_id;

	INSERT INTO field_types (name)
	VALUES ('Temporal smoke field type ' || left(v_suffix, 8))
	RETURNING field_type_id INTO v_field_type_id;

	INSERT INTO messages (message)
	VALUES ('Temporal smoke message ' || left(v_suffix, 8))
	RETURNING message_id INTO v_message_id;

	INSERT INTO qcs (name, name_de)
	VALUES (
		'temporal_smoke_qc_' || left(v_suffix, 12),
		'Temporal smoke qc ' || left(v_suffix, 8)
	)
	RETURNING qcs_id INTO v_qcs_id;

	INSERT INTO history_test_ids (
		user_id,
		account_id,
		list_id,
		field_type_id,
		message_id,
		qcs_id
	)
	VALUES (
		v_user_id,
		v_account_id,
		v_list_id,
		v_field_type_id,
		v_message_id,
		v_qcs_id
	);
END
$$;

COMMIT;

BEGIN;

UPDATE users
SET name = 'Temporal smoke user updated'
WHERE user_id = (SELECT user_id FROM history_test_ids);

UPDATE accounts
SET label = 'Temporal smoke account updated'
WHERE account_id = (SELECT account_id FROM history_test_ids);

UPDATE lists
SET name = 'Temporal smoke list updated'
WHERE list_id = (SELECT list_id FROM history_test_ids);

UPDATE field_types
SET comment = 'Temporal smoke field type updated'
WHERE field_type_id = (SELECT field_type_id FROM history_test_ids);

UPDATE messages
SET message = 'Temporal smoke message updated'
WHERE message_id = (SELECT message_id FROM history_test_ids);

UPDATE qcs
SET description = 'Temporal smoke qc updated'
WHERE qcs_id = (SELECT qcs_id FROM history_test_ids);

COMMIT;

BEGIN;

DELETE FROM accounts
WHERE account_id = (SELECT account_id FROM history_test_ids);

DELETE FROM users
WHERE user_id = (SELECT user_id FROM history_test_ids);

DELETE FROM lists
WHERE list_id = (SELECT list_id FROM history_test_ids);

DELETE FROM field_types
WHERE field_type_id = (SELECT field_type_id FROM history_test_ids);

DELETE FROM messages
WHERE message_id = (SELECT message_id FROM history_test_ids);

DELETE FROM qcs
WHERE qcs_id = (SELECT qcs_id FROM history_test_ids);

COMMIT;

-- Expect history_rows >= 2 for each table (one for UPDATE, one for DELETE).
SELECT 'users_history' AS table_name, count(*) AS history_rows
FROM users_history
WHERE user_id = (SELECT user_id FROM history_test_ids)
UNION ALL
SELECT 'accounts_history' AS table_name, count(*) AS history_rows
FROM accounts_history
WHERE account_id = (SELECT account_id FROM history_test_ids)
UNION ALL
SELECT 'lists_history' AS table_name, count(*) AS history_rows
FROM lists_history
WHERE list_id = (SELECT list_id FROM history_test_ids)
UNION ALL
SELECT 'field_types_history' AS table_name, count(*) AS history_rows
FROM field_types_history
WHERE field_type_id = (SELECT field_type_id FROM history_test_ids)
UNION ALL
SELECT 'messages_history' AS table_name, count(*) AS history_rows
FROM messages_history
WHERE message_id = (SELECT message_id FROM history_test_ids)
UNION ALL
SELECT 'qcs_history' AS table_name, count(*) AS history_rows
FROM qcs_history
WHERE qcs_id = (SELECT qcs_id FROM history_test_ids);

-- Sanity check that key new parents exist in pg_partman config.
WITH expected(parent_table) AS (
	VALUES
		('public.users_history'),
		('public.accounts_history'),
		('public.actions_history'),
		('public.checks_history'),
		('public.lists_history'),
		('public.list_values_history'),
		('public.field_types_history'),
		('public.fields_history'),
		('public.files_history'),
		('public.wms_services_history'),
		('public.wms_service_layers_history'),
		('public.wms_layers_history'),
		('public.wfs_services_history'),
		('public.wfs_service_layers_history'),
		('public.vector_layers_history'),
		('public.vector_layer_displays_history'),
		('public.qcs_history'),
		('public.qc_assignments_history')
),
missing AS (
	SELECT e.parent_table
	FROM expected e
	LEFT JOIN partman.part_config c
		ON c.parent_table = e.parent_table
	WHERE c.parent_table IS NULL
)
SELECT
	CASE
		WHEN EXISTS (SELECT 1 FROM missing) THEN 'missing_partman_entries'
		ELSE 'all_expected_partman_entries_present'
	END AS partman_check,
	coalesce(string_agg(m.parent_table, ', '), '') AS missing_parent_tables
FROM missing m;
