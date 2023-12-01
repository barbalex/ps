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

CREATE INDEX ON taxonomies((1))
WHERE
  obsolete;

CREATE INDEX ON taxonomies((1))
WHERE
  deleted;

CREATE INDEX ON taxa((1))
WHERE
  obsolete;

CREATE INDEX ON taxa((1))
WHERE
  deleted;

CREATE INDEX ON subproject_taxa((1))
WHERE
  deleted;

CREATE INDEX ON lists((1))
WHERE
  obsolete;

CREATE INDEX ON lists((1))
WHERE
  deleted;

CREATE INDEX ON list_values((1))
WHERE
  obsolete;

CREATE INDEX ON list_values((1))
WHERE
  deleted;

CREATE INDEX ON units((1))
WHERE
  deleted;

CREATE INDEX ON places((1))
WHERE
  deleted;