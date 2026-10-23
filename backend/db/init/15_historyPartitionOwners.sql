-- Normalize ownership of *_history partitions to partman_user.
--
-- The pg_partman background worker (pg_partman_bgw.role) runs maintenance as
-- partman_user and queries partitions directly, which requires ownership of
-- every partition in a set. 05_createHistoryTables.sql only transfers the
-- parent tables, and the seed dumps (11b/11d) create historical partitions
-- (e.g. subprojects_history_p2001) as postgres. Without this script the
-- worker fails with "permission denied for table <partition>" on startup
-- and exits with code 1.

DO $$
DECLARE
	r record;
BEGIN
	IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'partman_user') THEN
		RAISE NOTICE 'partman_user role missing, skipping partition ownership normalization';
		RETURN;
	END IF;

	FOR r IN
		SELECT n.nspname, c.relname AS child
		FROM pg_class c
		JOIN pg_inherits i ON i.inhrelid = c.oid
		JOIN pg_class p ON p.oid = i.inhparent
		JOIN pg_namespace n ON n.oid = p.relnamespace
		WHERE n.nspname = 'public'
			AND p.relname LIKE '%\_history'
			AND pg_get_userbyid(c.relowner) <> 'partman_user'
	LOOP
		EXECUTE format('ALTER TABLE %I.%I OWNER TO partman_user', r.nspname, r.child);
		RAISE NOTICE 'transferred %.% to partman_user', r.nspname, r.child;
	END LOOP;
END
$$;
