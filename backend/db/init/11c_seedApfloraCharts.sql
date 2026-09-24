-- charts for the apflora example data,
-- mirroring the three charts of the apf2 yearly report:
--   1. "(kontrollierte) Teil-Populationen"  — count_rows on places and checks
--   2. "Populationen nach Status"           — count_rows_by_distinct_field_values on places
--   3. "Triebe total" nach Populationen     — sum_values_of_field on check_taxa
-- They are defined on the project as templates (for_subprojects): every art
-- (subproject) of the apflora project offers them, computed against its own
-- data. Static companion to the generated 11b_seedApfloraExampleData.sql:
-- regenerating the apflora seed leaves this file untouched.
BEGIN;
-- re-running against an existing database would otherwise hit the
-- write-permission triggers installed by 12_writePermissionTriggers.sql
SET LOCAL electric.syncing TO 'true';

INSERT INTO charts (chart_id, project_id, name, years_since, subjects_stacked, for_subprojects) VALUES
  -- not stacked: kontrolliert is a subset of the tpops, so lines only (like apf2)
  ('a1000000-0000-4000-8000-000000000001', '0195a101-0000-7000-8000-000000000001', '(kontrollierte) Teil-Populationen', 2014, false, true),
  ('a2000000-0000-4000-8000-000000000002', '0195a101-0000-7000-8000-000000000001', 'Populationen nach Status', 2014, true, true),
  ('a3000000-0000-4000-8000-000000000003', '0195a101-0000-7000-8000-000000000001', '"Triebe total" nach Populationen', 2014, true, true)
  ON CONFLICT (chart_id) DO NOTHING;

INSERT INTO chart_subjects (chart_subject_id, chart_id, table_name, table_level, calc_method, field, value_unit, name, label, sort, fill_graded) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'places', '2', 'count_rows', NULL, NULL, 'Teil-Populationen', 'Teil-Populationen', 1, false),
  -- apf2 counts tpopber (the yearly place reports), not the checks
  ('b2000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'check_reports', '2', 'count_rows', NULL, NULL, 'kontrollierte Teil-Populationen', 'kontrollierte Teil-Populationen', 2, false),
  ('b3000000-0000-4000-8000-000000000003', 'a2000000-0000-4000-8000-000000000002', 'places', '1', 'count_rows_by_distinct_field_values', 'status', NULL, 'Status', 'Status', 1, false),
  ('b4000000-0000-4000-8000-000000000004', 'a3000000-0000-4000-8000-000000000003', 'check_taxa', '1', 'sum_values_of_field', 'quantity_numeric', '935432b9-fc64-7118-8167-06f985ea181f', 'Triebe total', 'Triebe total', 1, false)
  -- upserted: the unit is the chart's essence (a stale edit once left Pflanzen total here)
  ON CONFLICT (chart_subject_id) DO UPDATE SET value_unit = EXCLUDED.value_unit;

-- fail loudly if the charts are missing
DO $$
DECLARE
  got integer;
BEGIN
  SELECT count(*) INTO got FROM charts
  WHERE project_id = '0195a101-0000-7000-8000-000000000001'
    AND for_subprojects;
  IF got < 3 THEN
    RAISE EXCEPTION 'apflora charts seed: expected 3 project-level chart templates, got %', got;
  END IF;
  SELECT count(*) INTO got FROM chart_subjects cs
  JOIN charts c USING (chart_id)
  WHERE c.project_id = '0195a101-0000-7000-8000-000000000001'
    AND c.for_subprojects;
  IF got < 4 THEN
    RAISE EXCEPTION 'apflora charts seed: expected 4 chart subjects, got %', got;
  END IF;
END $$;
COMMIT;
