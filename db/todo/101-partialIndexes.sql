-- TODO:
-- when run during migrations, on startup get the following error:
-- Uncaught (in promise) Error: no such table: main.projects
-- works when run later
CREATE INDEX IF NOT EXISTS taxonomies_obsolete_idx ON taxonomies(obsolete)
WHERE
  obsolete;

CREATE INDEX IF NOT EXISTS lists_obsolete_idx ON lists(obsolete)
WHERE
  obsolete;

CREATE INDEX IF NOT EXISTS list_values_obsolete_idx ON list_values(obsolete)
WHERE
  obsolete;

CREATE INDEX IF NOT EXISTS actions_relevant_for_reports_idx ON actions(relevant_for_reports)
WHERE
  relevant_for_reports;

CREATE INDEX IF NOT EXISTS checks_relevant_for_reports_idx ON checks(relevant_for_reports)
WHERE
  relevant_for_reports;

CREATE INDEX IF NOT EXISTS fields_obsolete_idx ON fields(obsolete)
WHERE
  obsolete;

CREATE INDEX IF NOT EXISTS vector_layers_active_idx ON vector_layers(active)
WHERE
  active;

CREATE INDEX IF NOT EXISTS layer_presentations_active_idx ON layer_presentations(active)
WHERE
  active;

CREATE INDEX IF NOT EXISTS layer_presentations_grayscale_idx ON layer_presentations(grayscale)
WHERE
  grayscale;

