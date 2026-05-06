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
-- accounts -> accounts_history
-- Retention: 5 years
--
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE accounts
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE accounts
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN accounts.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS accounts_history (
	LIKE accounts INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE accounts_history OWNER TO partman_user;

COMMENT ON TABLE accounts_history IS 'System-versioned history of accounts. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN accounts_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS accounts_history_updated_at_idx
ON accounts_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS accounts_history_account_id_updated_at_idx
ON accounts_history USING btree (account_id, updated_at);

CREATE INDEX IF NOT EXISTS accounts_history_sys_period_idx
ON accounts_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_accounts_trigger'
			AND tgrelid = 'accounts'::regclass
	) THEN
		CREATE TRIGGER versioning_accounts_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON accounts
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'accounts_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- actions -> actions_history
-- Retention: 5 years
--
ALTER TABLE actions
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE actions
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE actions
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN actions.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS actions_history (
	LIKE actions INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE actions_history OWNER TO partman_user;

COMMENT ON TABLE actions_history IS 'System-versioned history of actions. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN actions_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS actions_history_updated_at_idx
ON actions_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS actions_history_action_id_updated_at_idx
ON actions_history USING btree (action_id, updated_at);

CREATE INDEX IF NOT EXISTS actions_history_sys_period_idx
ON actions_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_actions_trigger'
			AND tgrelid = 'actions'::regclass
	) THEN
		CREATE TRIGGER versioning_actions_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON actions
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'actions_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- checks -> checks_history
-- Retention: 5 years
--
ALTER TABLE checks
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE checks
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE checks
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN checks.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS checks_history (
	LIKE checks INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE checks_history OWNER TO partman_user;

COMMENT ON TABLE checks_history IS 'System-versioned history of checks. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN checks_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS checks_history_updated_at_idx
ON checks_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS checks_history_check_id_updated_at_idx
ON checks_history USING btree (check_id, updated_at);

CREATE INDEX IF NOT EXISTS checks_history_sys_period_idx
ON checks_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_checks_trigger'
			AND tgrelid = 'checks'::regclass
	) THEN
		CREATE TRIGGER versioning_checks_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON checks
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'checks_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- action_quantities -> action_quantities_history
-- Retention: 5 years
--
ALTER TABLE action_quantities
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE action_quantities
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE action_quantities
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN action_quantities.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS action_quantities_history (
	LIKE action_quantities INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE action_quantities_history OWNER TO partman_user;

COMMENT ON TABLE action_quantities_history IS 'System-versioned history of action_quantities. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN action_quantities_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS action_quantities_history_updated_at_idx
ON action_quantities_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS action_quantities_history_action_quantity_id_updated_at_idx
ON action_quantities_history USING btree (action_quantity_id, updated_at);

CREATE INDEX IF NOT EXISTS action_quantities_history_sys_period_idx
ON action_quantities_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_action_quantities_trigger'
			AND tgrelid = 'action_quantities'::regclass
	) THEN
		CREATE TRIGGER versioning_action_quantities_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON action_quantities
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'action_quantities_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- action_taxa -> action_taxa_history
-- Retention: 5 years
--
ALTER TABLE action_taxa
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE action_taxa
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE action_taxa
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN action_taxa.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS action_taxa_history (
	LIKE action_taxa INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE action_taxa_history OWNER TO partman_user;

COMMENT ON TABLE action_taxa_history IS 'System-versioned history of action_taxa. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN action_taxa_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS action_taxa_history_updated_at_idx
ON action_taxa_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS action_taxa_history_action_taxon_id_updated_at_idx
ON action_taxa_history USING btree (action_taxon_id, updated_at);

CREATE INDEX IF NOT EXISTS action_taxa_history_sys_period_idx
ON action_taxa_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_action_taxa_trigger'
			AND tgrelid = 'action_taxa'::regclass
	) THEN
		CREATE TRIGGER versioning_action_taxa_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON action_taxa
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'action_taxa_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- check_quantities -> check_quantities_history
-- Retention: 5 years
--
ALTER TABLE check_quantities
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE check_quantities
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE check_quantities
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN check_quantities.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS check_quantities_history (
	LIKE check_quantities INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE check_quantities_history OWNER TO partman_user;

COMMENT ON TABLE check_quantities_history IS 'System-versioned history of check_quantities. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN check_quantities_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS check_quantities_history_updated_at_idx
ON check_quantities_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS check_quantities_history_check_quantity_id_updated_at_idx
ON check_quantities_history USING btree (check_quantity_id, updated_at);

CREATE INDEX IF NOT EXISTS check_quantities_history_sys_period_idx
ON check_quantities_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_check_quantities_trigger'
			AND tgrelid = 'check_quantities'::regclass
	) THEN
		CREATE TRIGGER versioning_check_quantities_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON check_quantities
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'check_quantities_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- check_taxa -> check_taxa_history
-- Retention: 5 years
--
ALTER TABLE check_taxa
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE check_taxa
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE check_taxa
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN check_taxa.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS check_taxa_history (
	LIKE check_taxa INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE check_taxa_history OWNER TO partman_user;

COMMENT ON TABLE check_taxa_history IS 'System-versioned history of check_taxa. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN check_taxa_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS check_taxa_history_updated_at_idx
ON check_taxa_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS check_taxa_history_check_taxon_id_updated_at_idx
ON check_taxa_history USING btree (check_taxon_id, updated_at);

CREATE INDEX IF NOT EXISTS check_taxa_history_sys_period_idx
ON check_taxa_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_check_taxa_trigger'
			AND tgrelid = 'check_taxa'::regclass
	) THEN
		CREATE TRIGGER versioning_check_taxa_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON check_taxa
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'check_taxa_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- check_reports -> check_reports_history
-- Retention: 5 years
--
ALTER TABLE check_reports
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE check_reports
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE check_reports
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN check_reports.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS check_reports_history (
	LIKE check_reports INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE check_reports_history OWNER TO partman_user;

COMMENT ON TABLE check_reports_history IS 'System-versioned history of check_reports. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN check_reports_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS check_reports_history_updated_at_idx
ON check_reports_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS check_reports_history_place_check_report_id_updated_at_idx
ON check_reports_history USING btree (place_check_report_id, updated_at);

CREATE INDEX IF NOT EXISTS check_reports_history_sys_period_idx
ON check_reports_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_check_reports_trigger'
			AND tgrelid = 'check_reports'::regclass
	) THEN
		CREATE TRIGGER versioning_check_reports_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON check_reports
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'check_reports_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- check_report_quantities -> check_report_quantities_history
-- Retention: 5 years
--
ALTER TABLE check_report_quantities
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE check_report_quantities
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE check_report_quantities
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN check_report_quantities.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS check_report_quantities_history (
	LIKE check_report_quantities INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE check_report_quantities_history OWNER TO partman_user;

COMMENT ON TABLE check_report_quantities_history IS 'System-versioned history of check_report_quantities. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN check_report_quantities_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS check_report_quantities_history_updated_at_idx
ON check_report_quantities_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS check_report_quantities_history_quantity_id_updated_at_idx
ON check_report_quantities_history USING btree (place_check_report_quantity_id, updated_at);

CREATE INDEX IF NOT EXISTS check_report_quantities_history_sys_period_idx
ON check_report_quantities_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_check_report_quantities_trigger'
			AND tgrelid = 'check_report_quantities'::regclass
	) THEN
		CREATE TRIGGER versioning_check_report_quantities_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON check_report_quantities
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'check_report_quantities_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- action_reports -> action_reports_history
-- Retention: 5 years
--
ALTER TABLE action_reports
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE action_reports
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE action_reports
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN action_reports.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS action_reports_history (
	LIKE action_reports INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE action_reports_history OWNER TO partman_user;

COMMENT ON TABLE action_reports_history IS 'System-versioned history of action_reports. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN action_reports_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS action_reports_history_updated_at_idx
ON action_reports_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS action_reports_history_place_action_report_id_updated_at_idx
ON action_reports_history USING btree (place_action_report_id, updated_at);

CREATE INDEX IF NOT EXISTS action_reports_history_sys_period_idx
ON action_reports_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_action_reports_trigger'
			AND tgrelid = 'action_reports'::regclass
	) THEN
		CREATE TRIGGER versioning_action_reports_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON action_reports
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'action_reports_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- action_report_quantities -> action_report_quantities_history
-- Retention: 5 years
--
ALTER TABLE action_report_quantities
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE action_report_quantities
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE action_report_quantities
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN action_report_quantities.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS action_report_quantities_history (
	LIKE action_report_quantities INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE action_report_quantities_history OWNER TO partman_user;

COMMENT ON TABLE action_report_quantities_history IS 'System-versioned history of action_report_quantities. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN action_report_quantities_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS action_report_quantities_history_updated_at_idx
ON action_report_quantities_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS action_report_quantities_history_quantity_id_updated_at_idx
ON action_report_quantities_history USING btree (place_action_report_quantity_id, updated_at);

CREATE INDEX IF NOT EXISTS action_report_quantities_history_sys_period_idx
ON action_report_quantities_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_action_report_quantities_trigger'
			AND tgrelid = 'action_report_quantities'::regclass
	) THEN
		CREATE TRIGGER versioning_action_report_quantities_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON action_report_quantities
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'action_report_quantities_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- goals -> goals_history
-- Retention: 5 years
--
ALTER TABLE goals
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE goals
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE goals
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN goals.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS goals_history (
	LIKE goals INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE goals_history OWNER TO partman_user;

COMMENT ON TABLE goals_history IS 'System-versioned history of goals. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN goals_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS goals_history_updated_at_idx
ON goals_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS goals_history_goal_id_updated_at_idx
ON goals_history USING btree (goal_id, updated_at);

CREATE INDEX IF NOT EXISTS goals_history_sys_period_idx
ON goals_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_goals_trigger'
			AND tgrelid = 'goals'::regclass
	) THEN
		CREATE TRIGGER versioning_goals_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON goals
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'goals_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- goal_reports -> goal_reports_history
-- Retention: 5 years
--
ALTER TABLE goal_reports
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE goal_reports
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE goal_reports
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN goal_reports.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS goal_reports_history (
	LIKE goal_reports INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE goal_reports_history OWNER TO partman_user;

COMMENT ON TABLE goal_reports_history IS 'System-versioned history of goal_reports. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN goal_reports_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS goal_reports_history_updated_at_idx
ON goal_reports_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS goal_reports_history_goal_report_id_updated_at_idx
ON goal_reports_history USING btree (goal_report_id, updated_at);

CREATE INDEX IF NOT EXISTS goal_reports_history_sys_period_idx
ON goal_reports_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_goal_reports_trigger'
			AND tgrelid = 'goal_reports'::regclass
	) THEN
		CREATE TRIGGER versioning_goal_reports_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON goal_reports
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'goal_reports_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- subproject_reports -> subproject_reports_history
-- Retention: 5 years
--
ALTER TABLE subproject_reports
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE subproject_reports
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE subproject_reports
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN subproject_reports.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS subproject_reports_history (
	LIKE subproject_reports INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE subproject_reports_history OWNER TO partman_user;

COMMENT ON TABLE subproject_reports_history IS 'System-versioned history of subproject_reports. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN subproject_reports_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS subproject_reports_history_updated_at_idx
ON subproject_reports_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS subproject_reports_history_subproject_report_id_updated_at_idx
ON subproject_reports_history USING btree (subproject_report_id, updated_at);

CREATE INDEX IF NOT EXISTS subproject_reports_history_sys_period_idx
ON subproject_reports_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_subproject_reports_trigger'
			AND tgrelid = 'subproject_reports'::regclass
	) THEN
		CREATE TRIGGER versioning_subproject_reports_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON subproject_reports
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'subproject_reports_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- project_reports -> project_reports_history
-- Retention: 5 years
--
ALTER TABLE project_reports
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE project_reports
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE project_reports
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN project_reports.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS project_reports_history (
	LIKE project_reports INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE project_reports_history OWNER TO partman_user;

COMMENT ON TABLE project_reports_history IS 'System-versioned history of project_reports. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN project_reports_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS project_reports_history_updated_at_idx
ON project_reports_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS project_reports_history_project_report_id_updated_at_idx
ON project_reports_history USING btree (project_report_id, updated_at);

CREATE INDEX IF NOT EXISTS project_reports_history_sys_period_idx
ON project_reports_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_project_reports_trigger'
			AND tgrelid = 'project_reports'::regclass
	) THEN
		CREATE TRIGGER versioning_project_reports_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON project_reports
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'project_reports_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- lists -> lists_history
-- Retention: 5 years
--
ALTER TABLE lists
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE lists
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE lists
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN lists.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS lists_history (
	LIKE lists INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE lists_history OWNER TO partman_user;

COMMENT ON TABLE lists_history IS 'System-versioned history of lists. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN lists_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS lists_history_updated_at_idx
ON lists_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS lists_history_list_id_updated_at_idx
ON lists_history USING btree (list_id, updated_at);

CREATE INDEX IF NOT EXISTS lists_history_sys_period_idx
ON lists_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_lists_trigger'
			AND tgrelid = 'lists'::regclass
	) THEN
		CREATE TRIGGER versioning_lists_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON lists
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'lists_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- list_values -> list_values_history
-- Retention: 5 years
--
ALTER TABLE list_values
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE list_values
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE list_values
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN list_values.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS list_values_history (
	LIKE list_values INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE list_values_history OWNER TO partman_user;

COMMENT ON TABLE list_values_history IS 'System-versioned history of list_values. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN list_values_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS list_values_history_updated_at_idx
ON list_values_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS list_values_history_list_value_id_updated_at_idx
ON list_values_history USING btree (list_value_id, updated_at);

CREATE INDEX IF NOT EXISTS list_values_history_sys_period_idx
ON list_values_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_list_values_trigger'
			AND tgrelid = 'list_values'::regclass
	) THEN
		CREATE TRIGGER versioning_list_values_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON list_values
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'list_values_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- taxonomies -> taxonomies_history
-- Retention: 5 years
--
ALTER TABLE taxonomies
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE taxonomies
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE taxonomies
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN taxonomies.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS taxonomies_history (
	LIKE taxonomies INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE taxonomies_history OWNER TO partman_user;

COMMENT ON TABLE taxonomies_history IS 'System-versioned history of taxonomies. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN taxonomies_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS taxonomies_history_updated_at_idx
ON taxonomies_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS taxonomies_history_taxonomy_id_updated_at_idx
ON taxonomies_history USING btree (taxonomy_id, updated_at);

CREATE INDEX IF NOT EXISTS taxonomies_history_sys_period_idx
ON taxonomies_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_taxonomies_trigger'
			AND tgrelid = 'taxonomies'::regclass
	) THEN
		CREATE TRIGGER versioning_taxonomies_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON taxonomies
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'taxonomies_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- taxa -> taxa_history
-- Retention: 5 years
--
ALTER TABLE taxa
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE taxa
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE taxa
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN taxa.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS taxa_history (
	LIKE taxa INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE taxa_history OWNER TO partman_user;

COMMENT ON TABLE taxa_history IS 'System-versioned history of taxa. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN taxa_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS taxa_history_updated_at_idx
ON taxa_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS taxa_history_taxon_id_updated_at_idx
ON taxa_history USING btree (taxon_id, updated_at);

CREATE INDEX IF NOT EXISTS taxa_history_sys_period_idx
ON taxa_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_taxa_trigger'
			AND tgrelid = 'taxa'::regclass
	) THEN
		CREATE TRIGGER versioning_taxa_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON taxa
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'taxa_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- observation_imports -> observation_imports_history
-- Retention: 5 years
--
ALTER TABLE observation_imports
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE observation_imports
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE observation_imports
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN observation_imports.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS observation_imports_history (
	LIKE observation_imports INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE observation_imports_history OWNER TO partman_user;

COMMENT ON TABLE observation_imports_history IS 'System-versioned history of observation_imports. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN observation_imports_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS observation_imports_history_updated_at_idx
ON observation_imports_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS observation_imports_history_import_id_updated_at_idx
ON observation_imports_history USING btree (observation_import_id, updated_at);

CREATE INDEX IF NOT EXISTS observation_imports_history_sys_period_idx
ON observation_imports_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_observation_imports_trigger'
			AND tgrelid = 'observation_imports'::regclass
	) THEN
		CREATE TRIGGER versioning_observation_imports_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON observation_imports
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'observation_imports_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- observations -> observations_history
-- Retention: 5 years
--
ALTER TABLE observations
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE observations
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE observations
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN observations.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS observations_history (
	LIKE observations INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE observations_history OWNER TO partman_user;

COMMENT ON TABLE observations_history IS 'System-versioned history of observations. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN observations_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS observations_history_updated_at_idx
ON observations_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS observations_history_observation_id_updated_at_idx
ON observations_history USING btree (observation_id, updated_at);

CREATE INDEX IF NOT EXISTS observations_history_sys_period_idx
ON observations_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_observations_trigger'
			AND tgrelid = 'observations'::regclass
	) THEN
		CREATE TRIGGER versioning_observations_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON observations
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'observations_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- place_levels -> place_levels_history
-- Retention: 5 years
--
ALTER TABLE place_levels
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE place_levels
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE place_levels
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN place_levels.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS place_levels_history (
	LIKE place_levels INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE place_levels_history OWNER TO partman_user;

COMMENT ON TABLE place_levels_history IS 'System-versioned history of place_levels. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN place_levels_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS place_levels_history_updated_at_idx
ON place_levels_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS place_levels_history_place_level_id_updated_at_idx
ON place_levels_history USING btree (place_level_id, updated_at);

CREATE INDEX IF NOT EXISTS place_levels_history_sys_period_idx
ON place_levels_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_place_levels_trigger'
			AND tgrelid = 'place_levels'::regclass
	) THEN
		CREATE TRIGGER versioning_place_levels_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON place_levels
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'place_levels_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- project_crs -> project_crs_history
-- Retention: 5 years
--
ALTER TABLE project_crs
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE project_crs
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE project_crs
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN project_crs.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS project_crs_history (
	LIKE project_crs INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE project_crs_history OWNER TO partman_user;

COMMENT ON TABLE project_crs_history IS 'System-versioned history of project_crs. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN project_crs_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS project_crs_history_updated_at_idx
ON project_crs_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS project_crs_history_project_crs_id_updated_at_idx
ON project_crs_history USING btree (project_crs_id, updated_at);

CREATE INDEX IF NOT EXISTS project_crs_history_sys_period_idx
ON project_crs_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_project_crs_trigger'
			AND tgrelid = 'project_crs'::regclass
	) THEN
		CREATE TRIGGER versioning_project_crs_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON project_crs
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'project_crs_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- project_users -> project_users_history
-- Retention: 5 years
--
ALTER TABLE project_users
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE project_users
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE project_users
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN project_users.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS project_users_history (
	LIKE project_users INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE project_users_history OWNER TO partman_user;

COMMENT ON TABLE project_users_history IS 'System-versioned history of project_users. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN project_users_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS project_users_history_updated_at_idx
ON project_users_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS project_users_history_project_user_id_updated_at_idx
ON project_users_history USING btree (project_user_id, updated_at);

CREATE INDEX IF NOT EXISTS project_users_history_sys_period_idx
ON project_users_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_project_users_trigger'
			AND tgrelid = 'project_users'::regclass
	) THEN
		CREATE TRIGGER versioning_project_users_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON project_users
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'project_users_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- subproject_users -> subproject_users_history
-- Retention: 5 years
--
ALTER TABLE subproject_users
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE subproject_users
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE subproject_users
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN subproject_users.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS subproject_users_history (
	LIKE subproject_users INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE subproject_users_history OWNER TO partman_user;

COMMENT ON TABLE subproject_users_history IS 'System-versioned history of subproject_users. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN subproject_users_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS subproject_users_history_updated_at_idx
ON subproject_users_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS subproject_users_history_subproject_user_id_updated_at_idx
ON subproject_users_history USING btree (subproject_user_id, updated_at);

CREATE INDEX IF NOT EXISTS subproject_users_history_sys_period_idx
ON subproject_users_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_subproject_users_trigger'
			AND tgrelid = 'subproject_users'::regclass
	) THEN
		CREATE TRIGGER versioning_subproject_users_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON subproject_users
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'subproject_users_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- place_users -> place_users_history
-- Retention: 5 years
--
ALTER TABLE place_users
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE place_users
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE place_users
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN place_users.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS place_users_history (
	LIKE place_users INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE place_users_history OWNER TO partman_user;

COMMENT ON TABLE place_users_history IS 'System-versioned history of place_users. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN place_users_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS place_users_history_updated_at_idx
ON place_users_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS place_users_history_place_user_id_updated_at_idx
ON place_users_history USING btree (place_user_id, updated_at);

CREATE INDEX IF NOT EXISTS place_users_history_sys_period_idx
ON place_users_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_place_users_trigger'
			AND tgrelid = 'place_users'::regclass
	) THEN
		CREATE TRIGGER versioning_place_users_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON place_users
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'place_users_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- files -> files_history
-- Retention: 5 years
--
ALTER TABLE files
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE files
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE files
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN files.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS files_history (
	LIKE files INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE files_history OWNER TO partman_user;

COMMENT ON TABLE files_history IS 'System-versioned history of files. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN files_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS files_history_updated_at_idx
ON files_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS files_history_file_id_updated_at_idx
ON files_history USING btree (file_id, updated_at);

CREATE INDEX IF NOT EXISTS files_history_sys_period_idx
ON files_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_files_trigger'
			AND tgrelid = 'files'::regclass
	) THEN
		CREATE TRIGGER versioning_files_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON files
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'files_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- subproject_report_designs -> subproject_report_designs_history
-- Retention: 5 years
--
ALTER TABLE subproject_report_designs
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE subproject_report_designs
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE subproject_report_designs
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN subproject_report_designs.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS subproject_report_designs_history (
	LIKE subproject_report_designs INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE subproject_report_designs_history OWNER TO partman_user;

COMMENT ON TABLE subproject_report_designs_history IS 'System-versioned history of subproject_report_designs. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN subproject_report_designs_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS subproject_report_designs_history_updated_at_idx
ON subproject_report_designs_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS subproject_report_designs_history_id_updated_at_idx
ON subproject_report_designs_history USING btree (subproject_report_design_id, updated_at);

CREATE INDEX IF NOT EXISTS subproject_report_designs_history_sys_period_idx
ON subproject_report_designs_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_subproject_report_designs_trigger'
			AND tgrelid = 'subproject_report_designs'::regclass
	) THEN
		CREATE TRIGGER versioning_subproject_report_designs_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON subproject_report_designs
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'subproject_report_designs_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- project_report_subdesigns -> project_report_subdesigns_history
-- Retention: 5 years
--
ALTER TABLE project_report_subdesigns
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE project_report_subdesigns
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE project_report_subdesigns
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN project_report_subdesigns.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS project_report_subdesigns_history (
	LIKE project_report_subdesigns INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE project_report_subdesigns_history OWNER TO partman_user;

COMMENT ON TABLE project_report_subdesigns_history IS 'System-versioned history of project_report_subdesigns. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN project_report_subdesigns_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS project_report_subdesigns_history_updated_at_idx
ON project_report_subdesigns_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS project_report_subdesigns_history_id_updated_at_idx
ON project_report_subdesigns_history USING btree (project_report_subdesign_id, updated_at);

CREATE INDEX IF NOT EXISTS project_report_subdesigns_history_sys_period_idx
ON project_report_subdesigns_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_project_report_subdesigns_trigger'
			AND tgrelid = 'project_report_subdesigns'::regclass
	) THEN
		CREATE TRIGGER versioning_project_report_subdesigns_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON project_report_subdesigns
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'project_report_subdesigns_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- project_report_designs -> project_report_designs_history
-- Retention: 5 years
--
ALTER TABLE project_report_designs
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE project_report_designs
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE project_report_designs
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN project_report_designs.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS project_report_designs_history (
	LIKE project_report_designs INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE project_report_designs_history OWNER TO partman_user;

COMMENT ON TABLE project_report_designs_history IS 'System-versioned history of project_report_designs. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN project_report_designs_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS project_report_designs_history_updated_at_idx
ON project_report_designs_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS project_report_designs_history_id_updated_at_idx
ON project_report_designs_history USING btree (project_report_design_id, updated_at);

CREATE INDEX IF NOT EXISTS project_report_designs_history_sys_period_idx
ON project_report_designs_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_project_report_designs_trigger'
			AND tgrelid = 'project_report_designs'::regclass
	) THEN
		CREATE TRIGGER versioning_project_report_designs_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON project_report_designs
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'project_report_designs_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- vector_layers -> vector_layers_history
-- Retention: 5 years
--
ALTER TABLE vector_layers
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE vector_layers
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE vector_layers
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN vector_layers.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS vector_layers_history (
	LIKE vector_layers INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE vector_layers_history OWNER TO partman_user;

COMMENT ON TABLE vector_layers_history IS 'System-versioned history of vector_layers. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN vector_layers_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS vector_layers_history_updated_at_idx
ON vector_layers_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS vector_layers_history_id_updated_at_idx
ON vector_layers_history USING btree (vector_layer_id, updated_at);

CREATE INDEX IF NOT EXISTS vector_layers_history_sys_period_idx
ON vector_layers_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_vector_layers_trigger'
			AND tgrelid = 'vector_layers'::regclass
	) THEN
		CREATE TRIGGER versioning_vector_layers_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON vector_layers
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'vector_layers_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- vector_layer_displays -> vector_layer_displays_history
-- Retention: 5 years
--
ALTER TABLE vector_layer_displays
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE vector_layer_displays
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE vector_layer_displays
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN vector_layer_displays.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS vector_layer_displays_history (
	LIKE vector_layer_displays INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE vector_layer_displays_history OWNER TO partman_user;

COMMENT ON TABLE vector_layer_displays_history IS 'System-versioned history of vector_layer_displays. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN vector_layer_displays_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS vector_layer_displays_history_updated_at_idx
ON vector_layer_displays_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS vector_layer_displays_history_id_updated_at_idx
ON vector_layer_displays_history USING btree (vector_layer_display_id, updated_at);

CREATE INDEX IF NOT EXISTS vector_layer_displays_history_sys_period_idx
ON vector_layer_displays_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_vector_layer_displays_trigger'
			AND tgrelid = 'vector_layer_displays'::regclass
	) THEN
		CREATE TRIGGER versioning_vector_layer_displays_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON vector_layer_displays
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'vector_layer_displays_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- charts -> charts_history
-- Retention: 5 years
--
ALTER TABLE charts
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE charts
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE charts
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN charts.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS charts_history (
	LIKE charts INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE charts_history OWNER TO partman_user;

COMMENT ON TABLE charts_history IS 'System-versioned history of charts. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN charts_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS charts_history_updated_at_idx
ON charts_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS charts_history_chart_id_updated_at_idx
ON charts_history USING btree (chart_id, updated_at);

CREATE INDEX IF NOT EXISTS charts_history_sys_period_idx
ON charts_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_charts_trigger'
			AND tgrelid = 'charts'::regclass
	) THEN
		CREATE TRIGGER versioning_charts_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON charts
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'charts_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- chart_subjects -> chart_subjects_history
-- Retention: 5 years
--
ALTER TABLE chart_subjects
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE chart_subjects
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE chart_subjects
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN chart_subjects.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS chart_subjects_history (
	LIKE chart_subjects INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE chart_subjects_history OWNER TO partman_user;

COMMENT ON TABLE chart_subjects_history IS 'System-versioned history of chart_subjects. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN chart_subjects_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS chart_subjects_history_updated_at_idx
ON chart_subjects_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS chart_subjects_history_id_updated_at_idx
ON chart_subjects_history USING btree (chart_subject_id, updated_at);

CREATE INDEX IF NOT EXISTS chart_subjects_history_sys_period_idx
ON chart_subjects_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_chart_subjects_trigger'
			AND tgrelid = 'chart_subjects'::regclass
	) THEN
		CREATE TRIGGER versioning_chart_subjects_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON chart_subjects
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'chart_subjects_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- wms_services -> wms_services_history
-- Retention: 5 years
--
ALTER TABLE wms_services
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE wms_services
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE wms_services
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN wms_services.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS wms_services_history (
	LIKE wms_services INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE wms_services_history OWNER TO partman_user;

COMMENT ON TABLE wms_services_history IS 'System-versioned history of wms_services. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN wms_services_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS wms_services_history_updated_at_idx
ON wms_services_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS wms_services_history_id_updated_at_idx
ON wms_services_history USING btree (wms_service_id, updated_at);

CREATE INDEX IF NOT EXISTS wms_services_history_sys_period_idx
ON wms_services_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_wms_services_trigger'
			AND tgrelid = 'wms_services'::regclass
	) THEN
		CREATE TRIGGER versioning_wms_services_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON wms_services
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'wms_services_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- wms_service_layers -> wms_service_layers_history
-- Retention: 5 years
--
ALTER TABLE wms_service_layers
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE wms_service_layers
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE wms_service_layers
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN wms_service_layers.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS wms_service_layers_history (
	LIKE wms_service_layers INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE wms_service_layers_history OWNER TO partman_user;

COMMENT ON TABLE wms_service_layers_history IS 'System-versioned history of wms_service_layers. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN wms_service_layers_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS wms_service_layers_history_updated_at_idx
ON wms_service_layers_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS wms_service_layers_history_id_updated_at_idx
ON wms_service_layers_history USING btree (wms_service_layer_id, updated_at);

CREATE INDEX IF NOT EXISTS wms_service_layers_history_sys_period_idx
ON wms_service_layers_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_wms_service_layers_trigger'
			AND tgrelid = 'wms_service_layers'::regclass
	) THEN
		CREATE TRIGGER versioning_wms_service_layers_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON wms_service_layers
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'wms_service_layers_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- wms_layers -> wms_layers_history
-- Retention: 5 years
--
ALTER TABLE wms_layers
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE wms_layers
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE wms_layers
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN wms_layers.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS wms_layers_history (
	LIKE wms_layers INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE wms_layers_history OWNER TO partman_user;

COMMENT ON TABLE wms_layers_history IS 'System-versioned history of wms_layers. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN wms_layers_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS wms_layers_history_updated_at_idx
ON wms_layers_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS wms_layers_history_id_updated_at_idx
ON wms_layers_history USING btree (wms_layer_id, updated_at);

CREATE INDEX IF NOT EXISTS wms_layers_history_sys_period_idx
ON wms_layers_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_wms_layers_trigger'
			AND tgrelid = 'wms_layers'::regclass
	) THEN
		CREATE TRIGGER versioning_wms_layers_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON wms_layers
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'wms_layers_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- wfs_services -> wfs_services_history
-- Retention: 5 years
--
ALTER TABLE wfs_services
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE wfs_services
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE wfs_services
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN wfs_services.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS wfs_services_history (
	LIKE wfs_services INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE wfs_services_history OWNER TO partman_user;

COMMENT ON TABLE wfs_services_history IS 'System-versioned history of wfs_services. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN wfs_services_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS wfs_services_history_updated_at_idx
ON wfs_services_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS wfs_services_history_id_updated_at_idx
ON wfs_services_history USING btree (wfs_service_id, updated_at);

CREATE INDEX IF NOT EXISTS wfs_services_history_sys_period_idx
ON wfs_services_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_wfs_services_trigger'
			AND tgrelid = 'wfs_services'::regclass
	) THEN
		CREATE TRIGGER versioning_wfs_services_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON wfs_services
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'wfs_services_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- wfs_service_layers -> wfs_service_layers_history
-- Retention: 5 years
--
ALTER TABLE wfs_service_layers
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE wfs_service_layers
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE wfs_service_layers
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN wfs_service_layers.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS wfs_service_layers_history (
	LIKE wfs_service_layers INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE wfs_service_layers_history OWNER TO partman_user;

COMMENT ON TABLE wfs_service_layers_history IS 'System-versioned history of wfs_service_layers. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN wfs_service_layers_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS wfs_service_layers_history_updated_at_idx
ON wfs_service_layers_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS wfs_service_layers_history_id_updated_at_idx
ON wfs_service_layers_history USING btree (wfs_service_layer_id, updated_at);

CREATE INDEX IF NOT EXISTS wfs_service_layers_history_sys_period_idx
ON wfs_service_layers_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_wfs_service_layers_trigger'
			AND tgrelid = 'wfs_service_layers'::regclass
	) THEN
		CREATE TRIGGER versioning_wfs_service_layers_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON wfs_service_layers
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'wfs_service_layers_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- qc_assignments -> qc_assignments_history
-- Retention: 5 years
--
ALTER TABLE qc_assignments
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE qc_assignments
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE qc_assignments
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN qc_assignments.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS qc_assignments_history (
	LIKE qc_assignments INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE qc_assignments_history OWNER TO partman_user;

COMMENT ON TABLE qc_assignments_history IS 'System-versioned history of qc_assignments. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN qc_assignments_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS qc_assignments_history_updated_at_idx
ON qc_assignments_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS qc_assignments_history_id_updated_at_idx
ON qc_assignments_history USING btree (qc_assignment_id, updated_at);

CREATE INDEX IF NOT EXISTS qc_assignments_history_sys_period_idx
ON qc_assignments_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_qc_assignments_trigger'
			AND tgrelid = 'qc_assignments'::regclass
	) THEN
		CREATE TRIGGER versioning_qc_assignments_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON qc_assignments
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'qc_assignments_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- project_qcs -> project_qcs_history
-- Retention: 5 years
--
ALTER TABLE project_qcs
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

ALTER TABLE project_qcs
ADD COLUMN IF NOT EXISTS description text DEFAULT NULL;

ALTER TABLE project_qcs
ADD COLUMN IF NOT EXISTS sql text DEFAULT NULL;

ALTER TABLE project_qcs DROP COLUMN IF EXISTS description;

UPDATE project_qcs
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE project_qcs
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN project_qcs.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS project_qcs_history (
	LIKE project_qcs INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE project_qcs_history OWNER TO partman_user;

COMMENT ON TABLE project_qcs_history IS 'System-versioned history of project_qcs. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN project_qcs_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

ALTER TABLE project_qcs_history
ADD COLUMN IF NOT EXISTS description text DEFAULT NULL;

ALTER TABLE project_qcs_history
ADD COLUMN IF NOT EXISTS sql text DEFAULT NULL;

ALTER TABLE project_qcs_history DROP COLUMN IF EXISTS description;

CREATE INDEX IF NOT EXISTS project_qcs_history_updated_at_idx
ON project_qcs_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS project_qcs_history_project_qc_id_updated_at_idx
ON project_qcs_history USING btree (project_qc_id, updated_at);

CREATE INDEX IF NOT EXISTS project_qcs_history_sys_period_idx
ON project_qcs_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_project_qcs_trigger'
			AND tgrelid = 'project_qcs'::regclass
	) THEN
		CREATE TRIGGER versioning_project_qcs_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON project_qcs
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'project_qcs_history', true);
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
-- subproject_taxa -> subproject_taxa_history
-- Retention: 5 years
--
ALTER TABLE subproject_taxa
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE subproject_taxa
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE subproject_taxa
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN subproject_taxa.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS subproject_taxa_history (
	LIKE subproject_taxa INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE subproject_taxa_history OWNER TO partman_user;

COMMENT ON TABLE subproject_taxa_history IS 'System-versioned history of subproject_taxa. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN subproject_taxa_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS subproject_taxa_history_updated_at_idx
ON subproject_taxa_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS subproject_taxa_history_subproject_taxon_id_updated_at_idx
ON subproject_taxa_history USING btree (subproject_taxon_id, updated_at);

CREATE INDEX IF NOT EXISTS subproject_taxa_history_sys_period_idx
ON subproject_taxa_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_subproject_taxa_trigger'
			AND tgrelid = 'subproject_taxa'::regclass
	) THEN
		CREATE TRIGGER versioning_subproject_taxa_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON subproject_taxa
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'subproject_taxa_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- units -> units_history
-- Retention: 5 years
--
ALTER TABLE units
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE units
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE units
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN units.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS units_history (
	LIKE units INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE units_history OWNER TO partman_user;

COMMENT ON TABLE units_history IS 'System-versioned history of units. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN units_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS units_history_updated_at_idx
ON units_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS units_history_unit_id_updated_at_idx
ON units_history USING btree (unit_id, updated_at);

CREATE INDEX IF NOT EXISTS units_history_sys_period_idx
ON units_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_units_trigger'
			AND tgrelid = 'units'::regclass
	) THEN
		CREATE TRIGGER versioning_units_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON units
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'units_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- field_types -> field_types_history
-- Retention: 5 years
--
ALTER TABLE field_types
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE field_types
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE field_types
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN field_types.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS field_types_history (
	LIKE field_types INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE field_types_history OWNER TO partman_user;

COMMENT ON TABLE field_types_history IS 'System-versioned history of field_types. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN field_types_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS field_types_history_updated_at_idx
ON field_types_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS field_types_history_field_type_id_updated_at_idx
ON field_types_history USING btree (field_type_id, updated_at);

CREATE INDEX IF NOT EXISTS field_types_history_sys_period_idx
ON field_types_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_field_types_trigger'
			AND tgrelid = 'field_types'::regclass
	) THEN
		CREATE TRIGGER versioning_field_types_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON field_types
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'field_types_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- fields -> fields_history
-- Retention: 5 years
--
ALTER TABLE fields
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE fields
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE fields
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN fields.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS fields_history (
	LIKE fields INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE fields_history OWNER TO partman_user;

COMMENT ON TABLE fields_history IS 'System-versioned history of fields. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN fields_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS fields_history_updated_at_idx
ON fields_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS fields_history_field_id_updated_at_idx
ON fields_history USING btree (field_id, updated_at);

CREATE INDEX IF NOT EXISTS fields_history_sys_period_idx
ON fields_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_fields_trigger'
			AND tgrelid = 'fields'::regclass
	) THEN
		CREATE TRIGGER versioning_fields_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON fields
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'fields_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- messages -> messages_history
-- Retention: 5 years
--
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

UPDATE messages
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE messages
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN messages.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS messages_history (
	LIKE messages INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE messages_history OWNER TO partman_user;

COMMENT ON TABLE messages_history IS 'System-versioned history of messages. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN messages_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

CREATE INDEX IF NOT EXISTS messages_history_updated_at_idx
ON messages_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS messages_history_message_id_updated_at_idx
ON messages_history USING btree (message_id, updated_at);

CREATE INDEX IF NOT EXISTS messages_history_sys_period_idx
ON messages_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_messages_trigger'
			AND tgrelid = 'messages'::regclass
	) THEN
		CREATE TRIGGER versioning_messages_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON messages
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'messages_history', true);
	END IF;
END
$$;

--------------------------------------------------------------
-- qcs -> qcs_history
-- Retention: 5 years
--
ALTER TABLE qcs
ADD COLUMN IF NOT EXISTS sys_period tstzrange;

ALTER TABLE qcs DROP COLUMN IF EXISTS description;

UPDATE qcs
SET sys_period = tstzrange(updated_at, NULL, '[)')
WHERE sys_period IS NULL;

ALTER TABLE qcs
ALTER COLUMN sys_period SET NOT NULL;

COMMENT ON COLUMN qcs.sys_period IS 'System period maintained by temporal_tables for auditing and historic queries.';

CREATE TABLE IF NOT EXISTS qcs_history (
	LIKE qcs INCLUDING DEFAULTS
) PARTITION BY RANGE (updated_at);

ALTER TABLE qcs_history OWNER TO partman_user;

COMMENT ON TABLE qcs_history IS 'System-versioned history of qcs. Managed by temporal_tables and partitioned yearly by updated_at.';
COMMENT ON COLUMN qcs_history.sys_period IS 'System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current.';

ALTER TABLE qcs_history DROP COLUMN IF EXISTS description;

CREATE INDEX IF NOT EXISTS qcs_history_updated_at_idx
ON qcs_history USING btree (updated_at);

CREATE INDEX IF NOT EXISTS qcs_history_qcs_id_updated_at_idx
ON qcs_history USING btree (qcs_id, updated_at);

CREATE INDEX IF NOT EXISTS qcs_history_sys_period_idx
ON qcs_history USING gist (sys_period);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'versioning_qcs_trigger'
			AND tgrelid = 'qcs'::regclass
	) THEN
		CREATE TRIGGER versioning_qcs_trigger
		BEFORE INSERT OR UPDATE OR DELETE ON qcs
		FOR EACH ROW EXECUTE PROCEDURE versioning('sys_period', 'qcs_history', true);
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
	p_parent_table := 'public.accounts_history',
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
	WHERE parent_table = 'public.accounts_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.actions_history',
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
	WHERE parent_table = 'public.actions_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.checks_history',
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
	WHERE parent_table = 'public.checks_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.action_quantities_history',
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
	WHERE parent_table = 'public.action_quantities_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.action_taxa_history',
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
	WHERE parent_table = 'public.action_taxa_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.check_quantities_history',
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
	WHERE parent_table = 'public.check_quantities_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.check_taxa_history',
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
	WHERE parent_table = 'public.check_taxa_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.check_reports_history',
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
	WHERE parent_table = 'public.check_reports_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.check_report_quantities_history',
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
	WHERE parent_table = 'public.check_report_quantities_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.action_reports_history',
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
	WHERE parent_table = 'public.action_reports_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.action_report_quantities_history',
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
	WHERE parent_table = 'public.action_report_quantities_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.goals_history',
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
	WHERE parent_table = 'public.goals_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.goal_reports_history',
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
	WHERE parent_table = 'public.goal_reports_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.subproject_reports_history',
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
	WHERE parent_table = 'public.subproject_reports_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.project_reports_history',
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
	WHERE parent_table = 'public.project_reports_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.lists_history',
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
	WHERE parent_table = 'public.lists_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.list_values_history',
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
	WHERE parent_table = 'public.list_values_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.field_types_history',
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
	WHERE parent_table = 'public.field_types_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.fields_history',
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
	WHERE parent_table = 'public.fields_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.units_history',
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
	WHERE parent_table = 'public.units_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.subproject_taxa_history',
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
	WHERE parent_table = 'public.subproject_taxa_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.taxonomies_history',
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
	WHERE parent_table = 'public.taxonomies_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.taxa_history',
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
	WHERE parent_table = 'public.taxa_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.observation_imports_history',
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
	WHERE parent_table = 'public.observation_imports_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.observations_history',
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
	WHERE parent_table = 'public.observations_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.place_levels_history',
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
	WHERE parent_table = 'public.place_levels_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.project_crs_history',
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
	WHERE parent_table = 'public.project_crs_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.project_users_history',
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
	WHERE parent_table = 'public.project_users_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.subproject_users_history',
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
	WHERE parent_table = 'public.subproject_users_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.messages_history',
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
	WHERE parent_table = 'public.messages_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.place_users_history',
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
	WHERE parent_table = 'public.place_users_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.files_history',
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
	WHERE parent_table = 'public.files_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.subproject_report_designs_history',
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
	WHERE parent_table = 'public.subproject_report_designs_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.project_report_subdesigns_history',
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
	WHERE parent_table = 'public.project_report_subdesigns_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.project_report_designs_history',
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
	WHERE parent_table = 'public.project_report_designs_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.vector_layers_history',
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
	WHERE parent_table = 'public.vector_layers_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.vector_layer_displays_history',
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
	WHERE parent_table = 'public.vector_layer_displays_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.charts_history',
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
	WHERE parent_table = 'public.charts_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.chart_subjects_history',
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
	WHERE parent_table = 'public.chart_subjects_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.wms_services_history',
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
	WHERE parent_table = 'public.wms_services_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.wms_service_layers_history',
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
	WHERE parent_table = 'public.wms_service_layers_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.wms_layers_history',
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
	WHERE parent_table = 'public.wms_layers_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.wfs_services_history',
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
	WHERE parent_table = 'public.wfs_services_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.wfs_service_layers_history',
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
	WHERE parent_table = 'public.wfs_service_layers_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.qcs_history',
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
	WHERE parent_table = 'public.qcs_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.qc_assignments_history',
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
	WHERE parent_table = 'public.qc_assignments_history'
);

SELECT partman.create_parent(
	p_parent_table := 'public.project_qcs_history',
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
	WHERE parent_table = 'public.project_qcs_history'
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
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.accounts_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.actions_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.checks_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.action_quantities_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.action_taxa_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.check_quantities_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.check_taxa_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.check_reports_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.check_report_quantities_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.action_reports_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.action_report_quantities_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.goals_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.goal_reports_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.subproject_reports_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.project_reports_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.lists_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.list_values_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.field_types_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.fields_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.taxonomies_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.taxa_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.observation_imports_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.observations_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.place_levels_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = NULL,
	retention_keep_table = true,
	retention_keep_index = true
WHERE parent_table = 'public.project_crs_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.project_users_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.subproject_users_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.messages_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.place_users_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.files_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.subproject_report_designs_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.project_report_subdesigns_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.project_report_designs_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.vector_layers_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.vector_layer_displays_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.charts_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.chart_subjects_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.wms_services_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.wms_service_layers_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.wms_layers_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.wfs_services_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.wfs_service_layers_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.qcs_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.qc_assignments_history';

UPDATE partman.part_config
SET jobmon = false,
	retention = NULL,
	retention_keep_table = true,
	retention_keep_index = true
WHERE parent_table = 'public.projects_history';
UPDATE partman.part_config
SET jobmon = false,
	retention = '5 years',
	retention_keep_table = false,
	retention_keep_index = false
WHERE parent_table = 'public.project_qcs_history';


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
