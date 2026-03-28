-- This script intentionally leaves committed history rows behind in the
-- *_history tables. It deletes the current rows again, so only audit history
-- remains after the smoke test.

CREATE TEMP TABLE history_test_ids (
	project_id uuid,
	subproject_id uuid,
	place_id uuid
);

BEGIN;

DO $$
DECLARE
	v_project_id uuid;
	v_subproject_id uuid;
	v_place_id uuid;
BEGIN
	INSERT INTO projects (name)
	VALUES ('Temporal history smoke test project')
	RETURNING project_id INTO v_project_id;

	INSERT INTO subprojects (project_id, name)
	VALUES (v_project_id, 'Temporal history smoke test subproject')
	RETURNING subproject_id INTO v_subproject_id;

	INSERT INTO places (subproject_id, label)
	VALUES (v_subproject_id, 'Temporal history smoke test place')
	RETURNING place_id INTO v_place_id;

	INSERT INTO history_test_ids (project_id, subproject_id, place_id)
	VALUES (v_project_id, v_subproject_id, v_place_id);
END
$$;

COMMIT;

BEGIN;

UPDATE projects
SET name = 'Temporal history smoke test project updated'
WHERE project_id = (SELECT project_id FROM history_test_ids);

UPDATE subprojects
SET name = 'Temporal history smoke test subproject updated'
WHERE subproject_id = (SELECT subproject_id FROM history_test_ids);

UPDATE places
SET label = 'Temporal history smoke test place updated'
WHERE place_id = (SELECT place_id FROM history_test_ids);

COMMIT;

BEGIN;

DELETE FROM places
WHERE place_id = (SELECT place_id FROM history_test_ids);

DELETE FROM subprojects
WHERE subproject_id = (SELECT subproject_id FROM history_test_ids);

DELETE FROM projects
WHERE project_id = (SELECT project_id FROM history_test_ids);

COMMIT;

SELECT 'projects_history' AS table_name, count(*) AS history_rows
FROM projects_history
WHERE project_id = (SELECT project_id FROM history_test_ids)
UNION ALL
SELECT 'subprojects_history' AS table_name, count(*) AS history_rows
FROM subprojects_history
WHERE subproject_id = (SELECT subproject_id FROM history_test_ids)
UNION ALL
SELECT 'places_history' AS table_name, count(*) AS history_rows
FROM places_history
WHERE place_id = (SELECT place_id FROM history_test_ids);

SELECT
	project_id,
	name,
	updated_at,
	sys_period
FROM projects_history
WHERE project_id = (SELECT project_id FROM history_test_ids)
ORDER BY lower(sys_period);

SELECT
	subproject_id,
	project_id,
	name,
	updated_at,
	sys_period
FROM subprojects_history
WHERE subproject_id = (SELECT subproject_id FROM history_test_ids)
ORDER BY lower(sys_period);

SELECT
	place_id,
	subproject_id,
	label,
	updated_at,
	sys_period
FROM places_history
WHERE place_id = (SELECT place_id FROM history_test_ids)
ORDER BY lower(sys_period);