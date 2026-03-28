CREATE EXTENSION IF NOT EXISTS temporal_tables;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS dblink;
CREATE EXTENSION IF NOT EXISTS pg_jobmon;
CREATE SCHEMA IF NOT EXISTS partman;
CREATE EXTENSION IF NOT EXISTS pg_partman SCHEMA partman;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'partman_user') THEN
		CREATE ROLE partman_user LOGIN;
	END IF;
END
$$;

GRANT ALL ON SCHEMA partman TO partman_user;
GRANT ALL ON ALL TABLES IN SCHEMA partman TO partman_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA partman TO partman_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA partman TO partman_user;
GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA partman TO partman_user;

GRANT USAGE, CREATE ON SCHEMA public TO partman_user;

DO $$
DECLARE
	relation_record record;
	routine_record record;
BEGIN
	FOR relation_record IN
		SELECT n.nspname AS schema_name, c.relname AS object_name, c.relkind
		FROM pg_depend d
		JOIN pg_extension e ON e.oid = d.refobjid
		JOIN pg_class c ON c.oid = d.objid
		JOIN pg_namespace n ON n.oid = c.relnamespace
		WHERE e.extname = 'pg_jobmon'
			AND d.deptype = 'e'
	LOOP
		IF relation_record.relkind IN ('r', 'p', 'v', 'm', 'f') THEN
			EXECUTE format(
				'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE %I.%I TO partman_user',
				relation_record.schema_name,
				relation_record.object_name
			);
		ELSIF relation_record.relkind = 'S' THEN
			EXECUTE format(
				'GRANT USAGE, SELECT, UPDATE ON SEQUENCE %I.%I TO partman_user',
				relation_record.schema_name,
				relation_record.object_name
			);
		END IF;
	END LOOP;

	FOR routine_record IN
		SELECT
			n.nspname AS schema_name,
			p.proname AS routine_name,
			pg_get_function_identity_arguments(p.oid) AS identity_args,
			p.prokind
		FROM pg_depend d
		JOIN pg_extension e ON e.oid = d.refobjid
		JOIN pg_proc p ON p.oid = d.objid
		JOIN pg_namespace n ON n.oid = p.pronamespace
		WHERE e.extname IN ('pg_partman', 'pg_jobmon')
			AND d.deptype = 'e'
	LOOP
		EXECUTE format(
			'GRANT EXECUTE ON %s %I.%I(%s) TO partman_user',
			CASE WHEN routine_record.prokind = 'p' THEN 'PROCEDURE' ELSE 'FUNCTION' END,
			routine_record.schema_name,
			routine_record.routine_name,
			routine_record.identity_args
		);
	END LOOP;

	EXECUTE format(
		'GRANT TEMPORARY ON DATABASE %I TO partman_user',
		current_database()
	);
END
$$;

-- pg_partman maintenance as a non-superuser also requires this role to own any
-- partition sets it manages.