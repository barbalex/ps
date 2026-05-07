-- exports: general exports available to all projects
-- Generated from seed-data/exports.csv
-- Run `node backend/db/generate_exports_sql.mjs` from project root to regenerate after editing the CSV.

INSERT INTO exports (name_de, name_en, name_fr, name_it, level, filter_by_year, sql, description)
VALUES
('Projekte', '', '', '', 'root', false, NULL, 'query of all projects with all columns'),
('Projekte mit Statistik', '', '', '', 'root', false, NULL, 'project_id, label, counts of: subprojects, supbroject-report-designs, project-report-designs, project-reports, wms-services, wms-layers, wfs-services, vector-layers, lists, taxonomies, crs, place-levels, quality-controls, quality-controls-assigned, exports, exports-assigned. Plus: sums of statistics of subprojects. Plus: sums of statistics of places level 1. plus: sums of statistics of places level 2'),
('Teilprojekte', '', '', '', 'project', false, NULL, 'query of all subprojects with all columns'),
('Teilprojekte mit Statistik', '', '', '', 'project', false, NULL, 'subproject_id, label, counts of: goals, reports, taxa, users, files, obervation imports, obervations, observations to assess, observations not to assign, observations assigned, charts, places level 1. Plus: sums of statistics of places level 1. Plus: sums of statistics of places level 2 users level 2, files level 2'),
('Orte Stufe 1', '', '', '', 'subproject', false, NULL, 'place_id, label, counts of: checks, check-reports, actions, action-reports, observations assigned, users, files, places level 2. Plus: sums of statistics of places level 2')
ON CONFLICT (name_de) DO UPDATE SET
  name_en        = EXCLUDED.name_en,
  name_fr        = EXCLUDED.name_fr,
  name_it        = EXCLUDED.name_it,
  level          = EXCLUDED.level,
  filter_by_year = EXCLUDED.filter_by_year,
  description    = EXCLUDED.description;
  -- NOTE: sql is intentionally excluded from ON CONFLICT — it is user-edited and must not be overwritten by CSV regeneration.
