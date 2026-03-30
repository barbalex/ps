-- Full coverage smoke test for temporalized form-backed tables.
--
-- This script is read-only and does not modify application data.
-- It validates, per expected table:
-- 1) Live table exists.
-- 2) History table exists.
-- 3) Versioning trigger exists on the live table.
-- 4) pg_partman parent config exists.
-- 5) Retention config matches expectations.
-- 6) History table currently contains at least one row.

CREATE TEMP TABLE expected_history_config (
	table_name text PRIMARY KEY,
	retention_kind text NOT NULL -- '5_years' or 'keep_forever'
);

INSERT INTO expected_history_config (table_name, retention_kind)
VALUES
	('users', '5_years'),
	('accounts', '5_years'),
	('projects', 'keep_forever'),
	('subprojects', 'keep_forever'),
	('places', 'keep_forever'),
	('actions', '5_years'),
	('action_quantities', '5_years'),
	('action_taxa', '5_years'),
	('checks', '5_years'),
	('check_quantities', '5_years'),
	('check_taxa', '5_years'),
	('check_reports', '5_years'),
	('check_report_quantities', '5_years'),
	('action_reports', '5_years'),
	('action_report_quantities', '5_years'),
	('messages', '5_years'),
	('place_users', '5_years'),
	('goals', '5_years'),
	('goal_reports', '5_years'),
	('subproject_reports', '5_years'),
	('project_reports', '5_years'),
	('subproject_report_designs', '5_years'),
	('project_report_subdesigns', '5_years'),
	('project_report_designs', '5_years'),
	('files', '5_years'),
	('field_types', '5_years'),
	('widget_types', '5_years'),
	('widgets_for_fields', '5_years'),
	('fields', '5_years'),
	('place_levels', '5_years'),
	('project_users', '5_years'),
	('subproject_users', '5_years'),
	('taxonomies', '5_years'),
	('taxa', '5_years'),
	('subproject_taxa', '5_years'),
	('lists', '5_years'),
	('list_values', '5_years'),
	('units', '5_years'),
	('observation_imports', '5_years'),
	('observations', '5_years'),
	('wms_services', '5_years'),
	('wms_service_layers', '5_years'),
	('wms_layers', '5_years'),
	('wfs_services', '5_years'),
	('wfs_service_layers', '5_years'),
	('vector_layers', '5_years'),
	('vector_layer_displays', '5_years'),
	('charts', '5_years'),
	('chart_subjects', '5_years'),
	('qcs', '5_years'),
	('qcs_assignment', '5_years');

CREATE TEMP TABLE history_coverage_results (
	table_name text,
	retention_kind text,
	live_table_exists boolean,
	history_table_exists boolean,
	trigger_exists boolean,
	partman_entry_exists boolean,
	retention_matches boolean,
	history_rows bigint,
	history_has_rows boolean,
	all_checks_pass boolean
);

DO $$
DECLARE
	r record;
	v_live_reg regclass;
	v_history_reg regclass;
	v_trigger_exists boolean;
	v_partman_exists boolean;
	v_retention text;
	v_keep_table boolean;
	v_keep_index boolean;
	v_retention_matches boolean;
	v_history_rows bigint;
BEGIN
	FOR r IN
		SELECT table_name, retention_kind
		FROM expected_history_config
		ORDER BY table_name
	LOOP
		v_live_reg := to_regclass('public.' || r.table_name);
		v_history_reg := to_regclass('public.' || r.table_name || '_history');

		v_trigger_exists := false;
		IF v_live_reg IS NOT NULL THEN
			SELECT EXISTS (
				SELECT 1
				FROM pg_trigger t
				WHERE t.tgname = 'versioning_' || r.table_name || '_trigger'
					AND t.tgrelid = v_live_reg
			) INTO v_trigger_exists;
		END IF;

		SELECT
			(c.parent_table IS NOT NULL),
			c.retention,
			c.retention_keep_table,
			c.retention_keep_index
		INTO
			v_partman_exists,
			v_retention,
			v_keep_table,
			v_keep_index
		FROM partman.part_config c
		WHERE c.parent_table = 'public.' || r.table_name || '_history';

		IF v_partman_exists IS DISTINCT FROM true THEN
			v_partman_exists := false;
		END IF;

		IF r.retention_kind = 'keep_forever' THEN
			v_retention_matches := (
				v_partman_exists
				AND v_retention IS NULL
				AND v_keep_table IS TRUE
				AND v_keep_index IS TRUE
			);
		ELSE
			v_retention_matches := (
				v_partman_exists
				AND v_retention = '5 years'
				AND v_keep_table IS FALSE
				AND v_keep_index IS FALSE
			);
		END IF;

		v_history_rows := NULL;
		IF v_history_reg IS NOT NULL THEN
			EXECUTE format('SELECT count(*)::bigint FROM %I', r.table_name || '_history')
			INTO v_history_rows;
		END IF;

		INSERT INTO history_coverage_results (
			table_name,
			retention_kind,
			live_table_exists,
			history_table_exists,
			trigger_exists,
			partman_entry_exists,
			retention_matches,
			history_rows,
			history_has_rows,
			all_checks_pass
		)
		VALUES (
			r.table_name,
			r.retention_kind,
			v_live_reg IS NOT NULL,
			v_history_reg IS NOT NULL,
			v_trigger_exists,
			v_partman_exists,
			v_retention_matches,
			v_history_rows,
			coalesce(v_history_rows, 0) > 0,
			(
				v_live_reg IS NOT NULL
				AND v_history_reg IS NOT NULL
				AND v_trigger_exists
				AND v_partman_exists
				AND v_retention_matches
				AND coalesce(v_history_rows, 0) > 0
			)
		);
	END LOOP;
END
$$;

-- Full per-table report.
SELECT
	table_name,
	retention_kind,
	live_table_exists,
	history_table_exists,
	trigger_exists,
	partman_entry_exists,
	retention_matches,
	history_rows,
	history_has_rows,
	all_checks_pass
FROM history_coverage_results
ORDER BY table_name;

-- Summary counts.
SELECT
	count(*) AS total_expected_tables,
	sum(CASE WHEN live_table_exists THEN 1 ELSE 0 END) AS live_table_ok,
	sum(CASE WHEN history_table_exists THEN 1 ELSE 0 END) AS history_table_ok,
	sum(CASE WHEN trigger_exists THEN 1 ELSE 0 END) AS trigger_ok,
	sum(CASE WHEN partman_entry_exists THEN 1 ELSE 0 END) AS partman_ok,
	sum(CASE WHEN retention_matches THEN 1 ELSE 0 END) AS retention_ok,
	sum(CASE WHEN history_has_rows THEN 1 ELSE 0 END) AS history_rows_ok,
	sum(CASE WHEN all_checks_pass THEN 1 ELSE 0 END) AS all_checks_ok
FROM history_coverage_results;

-- Only failing tables.
SELECT
	table_name,
	retention_kind,
	live_table_exists,
	history_table_exists,
	trigger_exists,
	partman_entry_exists,
	retention_matches,
	history_rows,
	history_has_rows,
	all_checks_pass
FROM history_coverage_results
WHERE NOT all_checks_pass
ORDER BY table_name;
