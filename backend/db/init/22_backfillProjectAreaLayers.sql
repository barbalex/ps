-- Run after all seed data. Also safe to apply to an existing server (after
-- 08_projectAreaLayer.sql); never synthesize children on receiving clients.
BEGIN;
SET LOCAL electric.syncing = 'true';
SELECT provision_project_area_layer(project_id) FROM projects;
COMMIT;
