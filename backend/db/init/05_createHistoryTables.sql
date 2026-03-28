-- Temporal history tables used only on the server.
-- Pattern per live table:
-- 1. Add sys_period to the live table and backfill it from updated_at.
-- 2. Create a partitioned *_history table on updated_at.
-- 3. Attach temporal_tables versioning trigger to archive old row versions.
-- 4. Register the *_history table with pg_partman for yearly partitions.
-- 5. Configure retention/jobmon per history table in partman.part_config.

--------------------------------------------------------------
-- users -> users_history
-- Retention: 5 years
--
ALTER TABLE users
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE users
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE users
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN users.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS users_history (
	LIKE users INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE users_history OWNER TO partman_user;

COMMENT ON TABLE users_history IS 'System-versioned history of users. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN users_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS users_history_updated_at_idx
ON users_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS users_history_user_id_updated_at_idx
ON users_history USING btree (user_id, updated_at);

CREATE INDEX IF NOT EXISTS users_history_sys_period_idx
ON users_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_users_trigger'
			AND tgrelid = 'users'::regclass
	) THEN
		CREATE TRIGGER versioning_users_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON users
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'users_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- projects -> projects_history
-- Retention: keep forever
--
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE projects
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE projects
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN projects.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS projects_history (
	LIKE projects INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE projects_history OWNER TO partman_user;

COMMENT ON TABLE projects_history IS 'System-versioned history of projects. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN projects_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS projects_history_updated_at_idx
ON projects_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS projects_history_project_id_updated_at_idx
ON projects_history USING btree (project_id, updated_at);

CREATE INDEX IF NOT EXISTS projects_history_sys_period_idx
ON projects_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_projects_trigger'
			AND tgrelid = 'projects'::regclass
	) THEN
		CREATE TRIGGER versioning_projects_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON projects
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'projects_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- subprojects -> subprojects_history
-- Retention: keep forever
--
ALTER TABLE subprojects
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE subprojects
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE subprojects
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN subprojects.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS subprojects_history (
	subproject_id uuid NOT NULL,
	account_id uuid DEFAULT NULL,
	project_id uuid DEFAULT NULL,
	name text DEFAULT NULL,
	start_year integer DEFAULT NULL,
	end_year integer DEFAULT NULL,
	data jsonb DEFAULT NULL,
	label text DEFAULT NULL,
	created_at timestamptz NOT NULL,
	updated_at timestamptz NOT NULL,
	updated_by text DEFAULT NULL,
	sys_period tstzrange NOT NULL
) PARTITION BY RANGE (updated_at);

ALTER TABLE subprojects_history OWNER TO partman_user;

COMMENT ON TABLE subprojects_history IS 'System-versioned history of subprojects. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN subprojects_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS subprojects_history_updated_at_idx
ON subprojects_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS subprojects_history_subproject_id_updated_at_idx
ON subprojects_history USING btree (subproject_id, updated_at);

CREATE INDEX IF NOT EXISTS subprojects_history_sys_period_idx
ON subprojects_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_subprojects_trigger'
			AND tgrelid = 'subprojects'::regclass
	) THEN
		CREATE TRIGGER versioning_subprojects_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON subprojects
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'subprojects_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- places -> places_history
-- Retention: keep forever
--
ALTER TABLE places
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE places
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE places
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN places.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS places_history (
	LIKE places INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE places_history OWNER TO partman_user;

COMMENT ON TABLE places_history IS 'System-versioned history of places. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN places_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS places_history_updated_at_idx
ON places_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS places_history_place_id_updated_at_idx
ON places_history USING btree (place_id, updated_at);

CREATE INDEX IF NOT EXISTS places_history_sys_period_idx
ON places_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_places_trigger'
			AND tgrelid = 'places'::regclass
	) THEN
		CREATE TRIGGER versioning_places_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON places
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'places_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- pg_partman registration
--
SET ROLE partman_user;

SELECT partman.create_parent(
	p_parent_table := 'public.users_history',
	p_control := 'updated_at',
	p_interval := '1 year',
	p_type := 'range',
	p_premake := 4,
	p_start_partition := to_char(date_trunc('year', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),
	p_default_table := true,
	p_automatic_maintenance := 'on',
	p_jobmon := false
)
WHERE NOT EXISTS (
	SELECT 1
	FROM partman.part_config
	WHERE parent_table = 'public.users_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.projects_history',
	p_control := 'updated_at',
	p_interval := '1 year',
	p_type := 'range',
	p_premake := 4,
	p_start_partition := to_char(date_trunc('year', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),
	p_default_table := true,
	p_automatic_maintenance := 'on',
	p_jobmon := false
)
WHERE NOT EXISTS (
	SELECT 1
	FROM partman.part_config
	WHERE parent_table = 'public.projects_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.subprojects_history',
	p_control := 'updated_at',
	p_interval := '1 year',
	p_type := 'range',
	p_premake := 4,
	p_start_partition := to_char(date_trunc('year', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),
	p_default_table := true,
	p_automatic_maintenance := 'on',
	p_jobmon := false
)
WHERE NOT EXISTS (
	SELECT 1
	FROM partman.part_config
	WHERE parent_table = 'public.subprojects_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.places_history',
	p_control := 'updated_at',
	p_interval := '1 year',
	p_type := 'range',
	p_premake := 4,
	p_start_partition := to_char(date_trunc('year', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),
	p_default_table := true,
	p_automatic_maintenance := 'on',
	p_jobmon := false
)
WHERE NOT EXISTS (
	SELECT 1
	FROM partman.part_config
	WHERE parent_table = 'public.places_history'
);

--------------------------------------------------------------
-- pg_partman runtime config
-- retention = NULL means keep forever for these three history tables
--
UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.users_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = NULL,
	retention_keep_table = true,
	retention_keep_index = true
WHERE parent_table = 'public.projects_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = NULL,
	retention_keep_table = true,
	retention_keep_index = true
WHERE parent_table = 'public.subprojects_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = NULL,
	retention_keep_table = true,
	retention_keep_index = true
WHERE parent_table = 'public.places_history';

RESET ROLE;
