-- Propagate general roles after seeding.
--
-- The seed scripts insert projects, subprojects and places in electric-sync
-- mode (electric.syncing = true), which by design disables the role cascade
-- and inheritance triggers (project_roles_cascade_trigger,
-- subprojects_insert_inherit_role_trigger, places_insert_inherit_role_trigger
-- in 07_triggers.sql). General roles therefore never reach the lower levels:
-- the project owner sees the species list but no populations, goals, etc.
--
-- This script writes exactly what those triggers would have written, in sync
-- mode (so the write-enforcement triggers allow it), idempotently:
-- 1. every general project role cascades to the demo subprojects and places
-- 2. every general subproject role cascades to the places of that subproject
--
-- NB: propagation is limited to a small set of species. With 600 species the
-- full cascade means ~120k synced rows per user (hours of syncing, 1.8GB
-- browser memory); the demo subset keeps local development fast.

BEGIN;
SET LOCAL electric.syncing TO 'true';

CREATE TEMP TABLE demo_subprojects(subproject_id uuid) ON COMMIT DROP;
INSERT INTO demo_subprojects(subproject_id) VALUES
  -- Aldrovanda vesiculosa
  ('017d3472-d75d-7095-82f2-34b3a41b09f2'),
  -- Pulsatilla vulgaris
  ('017d3472-d75d-7a4f-8040-dfdd5df00bdb');

-- general project roles cascade to the demo subprojects
INSERT INTO subproject_roles(subproject_id, project_user_id, role, label)
SELECT d.subproject_id, pr.project_user_id, pr.role,
  pu.email || ' (' || pr.role || ')'
FROM project_roles pr
JOIN project_users pu USING (project_user_id)
CROSS JOIN demo_subprojects d
JOIN subprojects s ON s.subproject_id = d.subproject_id AND s.project_id = pr.project_id
WHERE pr.role NOT IN ('read-specific', 'write-specific')
ON CONFLICT (project_user_id, subproject_id) DO UPDATE SET role = EXCLUDED.role, label = EXCLUDED.label;

-- general project roles cascade to the places of the demo subprojects
INSERT INTO place_roles(place_id, project_user_id, role, label)
SELECT p.place_id, pr.project_user_id, pr.role,
  pu.email || ' (' || pr.role || ')'
FROM project_roles pr
JOIN project_users pu USING (project_user_id)
CROSS JOIN demo_subprojects d
JOIN subprojects s ON s.subproject_id = d.subproject_id AND s.project_id = pr.project_id
JOIN places p ON p.subproject_id = d.subproject_id
WHERE pr.role NOT IN ('read-specific', 'write-specific')
ON CONFLICT (project_user_id, place_id) DO UPDATE SET role = EXCLUDED.role, label = EXCLUDED.label;

-- general subproject roles cascade to the places of that subproject
INSERT INTO place_roles(place_id, project_user_id, role, label)
SELECT p.place_id, sr.project_user_id, sr.role,
  pu.email || ' (' || sr.role || ')'
FROM subproject_roles sr
JOIN project_users pu USING (project_user_id)
JOIN places p ON p.subproject_id = sr.subproject_id
WHERE sr.role NOT IN ('read-specific', 'write-specific')
ON CONFLICT (project_user_id, place_id) DO UPDATE SET role = EXCLUDED.role, label = EXCLUDED.label;

COMMIT;
