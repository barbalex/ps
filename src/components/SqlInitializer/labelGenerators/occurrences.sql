UPDATE
  occurrences
SET
  label = iif(oi.label_creation IS NOT NULL,
    -- TODO: loop all labelElements using json_each()
    -- https://www.sqlite.org/json1.html#jeach, TODO: see: https://stackoverflow.com/a/55937176/712005
    -- then iif type is separator, add value, else add value of json_extract(data, '$.value'):
    concat('TODO:', 'loop all labelElements and replace with values from occurrences'), NEW.occurrence_id)
FROM (
  SELECT
    label_creation
  FROM
    occurrence_imports
  WHERE
    occurrence_import_id = NEW.occurrence_import_id) AS oi,
(
    SELECT
      json_each(occurrence_imports.label_creation)
    FROM
      occurrence_imports
    WHERE
      occurrence_import_id = NEW.occurrence_import_id) AS labelElements
WHERE
  occurrences.occurrence_id = NEW.occurrence_id;

-- 1. extract type and value from label elements
SELECT
  occurrence_imports.occurrence_import_id,
  json_extract(labelElements.value, '$.type') as type,
  json_extract(labelElements.value, '$.value') as value
FROM
  occurrence_imports
  JOIN json_each(occurrence_imports.label_creation) AS labelElements
WHERE
  occurrence_imports.occurrence_import_id = 1;


