-- TODO:
-- when run during migrations, on startup get the following error:
-- Uncaught (in promise) Error: no such table: main.projects
-- works when run later
CREATE INDEX IF NOT EXISTS users_deleted_idx ON users(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS projects_deleted_idx ON projects(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS place_levels_deleted_idx ON place_levels(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS subprojects_deleted_idx ON subprojects(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS project_users_deleted_idx ON project_users(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS subproject_users_deleted_idx ON subproject_users(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS persons_deleted_idx ON persons(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS taxonomies_obsolete_idx ON taxonomies(obsolete)
WHERE
  obsolete;

CREATE INDEX IF NOT EXISTS taxonomies_deleted_idx ON taxonomies(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS taxa_deleted_idx ON taxa(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS subproject_taxa_deleted_idx ON subproject_taxa(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS lists_obsolete_idx ON lists(obsolete)
WHERE
  obsolete;

CREATE INDEX IF NOT EXISTS lists_deleted_idx ON lists(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS list_values_obsolete_idx ON list_values(obsolete)
WHERE
  obsolete;

CREATE INDEX IF NOT EXISTS list_values_deleted_idx ON list_values(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS units_deleted_idx ON units(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS places_deleted_idx ON places(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS actions_relevant_for_reports_idx ON actions(relevant_for_reports)
WHERE
  relevant_for_reports;

CREATE INDEX IF NOT EXISTS actions_deleted_idx ON actions(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS action_values_deleted_idx ON action_values(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS action_reports_deleted_idx ON action_reports(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS action_report_values_deleted_idx ON action_report_values(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS checks_relevant_for_reports_idx ON checks(relevant_for_reports)
WHERE
  relevant_for_reports;

CREATE INDEX IF NOT EXISTS checks_deleted_idx ON checks(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS check_values_deleted_idx ON check_values(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS check_taxa_deleted_idx ON check_taxa(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS place_reports_deleted_idx ON place_reports(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS place_report_values_deleted_idx ON place_report_values(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS observation_sources_deleted_idx ON observation_sources(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS observations_deleted_idx ON observations(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS place_users_deleted_idx ON place_users(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS goals_deleted_idx ON goals(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS goal_reports_deleted_idx ON goal_reports(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS goal_report_values_deleted_idx ON goal_report_values(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS subproject_reports_deleted_idx ON subproject_reports(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS project_reports_deleted_idx ON project_reports(deleted)
WHERE
  deleted;

-- CREATE INDEX if not exists files_deleted_idx ON files(deleted) WHERE deleted;
CREATE INDEX IF NOT EXISTS field_types_deleted_idx ON field_types(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS widget_types_deleted_idx ON widget_types(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS widgets_for_fields_deleted_idx ON widgets_for_fields(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS fields_obsolete_idx ON fields(obsolete)
WHERE
  obsolete;

CREATE INDEX IF NOT EXISTS fields_deleted_idx ON fields(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS gbif_occurrence_downloads_deleted_idx ON gbif_occurrence_downloads(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS tile_layers_deleted_idx ON tile_layers(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS vector_layers_active_idx ON vector_layers(active)
WHERE
  active;

CREATE INDEX IF NOT EXISTS vector_layers_deleted_idx ON vector_layers(deleted)
WHERE
  deleted;

CREATE INDEX IF NOT EXISTS vector_layer_displays_deleted_idx ON vector_layer_displays(deleted)
WHERE
  deleted;

