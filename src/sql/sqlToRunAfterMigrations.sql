CREATE INDEX ON users((1))
WHERE
  deleted;

CREATE INDEX ON projects((1))
WHERE
  deleted;

CREATE INDEX ON place_levels((1))
WHERE
  deleted;

CREATE INDEX ON subprojects((1))
WHERE
  deleted;

CREATE INDEX ON project_users((1))
WHERE
  deleted;

CREATE INDEX ON subproject_users((1))
WHERE
  deleted;

