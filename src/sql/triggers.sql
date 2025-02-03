

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