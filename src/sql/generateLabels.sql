ALTER TABLE projects
  ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, project_id));

CREATE INDEX IF NOT EXISTS projects_label_idx ON projects(label);

