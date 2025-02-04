

-- if occurrence_imports.label_creation is changed, need to update all labels of occurrences
CREATE OR REPLACE FUNCTION occurrence_imports_label_creation_trigger ()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE occurrences
    SET
      label = (
        SELECT
          string_agg (
            case when oi.label_creation ->> 'type' = 'separator' then oi.label_creation ->> 'value' else o.data ->> (oi.label_creation ->> 'value') end, ''
          )
        FROM
          occurrences o
          INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id
        WHERE
          o.occurrence_id = occurrences.occurrence_id
        GROUP BY
          o.occurrence_id)
    WHERE
      occurrences.occurrence_import_id = NEW.occurrence_import_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER occurrence_imports_label_creation_trigger
  AFTER update OF label_creation ON occurrence_imports
  FOR EACH ROW
  EXECUTE PROCEDURE occurrence_imports_label_creation_trigger();

-- if accounts.projects_label_by is changed, need to update all labels of projects
CREATE OR REPLACE FUNCTION accounts_projects_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects SET label = CASE
  WHEN NEW.projects_label_by is null THEN name
  WHEN NEW.projects_label_by = 'name' THEN name
  ELSE coalesce(data ->> NEW.projects_label_by, project_id::text)
  END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER accounts_projects_label_trigger
  AFTER UPDATE OF projects_label_by ON accounts
  FOR EACH ROW
  EXECUTE PROCEDURE accounts_projects_label_trigger();