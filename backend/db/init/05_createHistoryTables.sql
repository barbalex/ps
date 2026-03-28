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

SET ROLE partman_user;

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

UPDATE partman.part_config
SET jobmon = false
WHERE parent_table = 'public.subprojects_history';

RESET ROLE;
