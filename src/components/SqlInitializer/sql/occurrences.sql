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
  json_extract(labelElements.value, '$.type') AS type,
  json_extract(labelElements.value, '$.value') AS value
FROM
  occurrence_imports
  JOIN json_each(occurrence_imports.label_creation) AS labelElements
WHERE
  occurrence_imports.occurrence_import_id = 1;

-- 2. get occurrence with label elements
SELECT
  occurrences.occurrence_id,
  json_extract(labelElements.value, '$.type') AS type,
  json_extract(labelElements.value, '$.value') AS value
FROM
  occurrences
  INNER JOIN occurrence_imports ON occurrences.occurrence_import_id = occurrence_imports.occurrence_import_id
  JOIN json_each(occurrence_imports.label_creation) AS labelElements
WHERE
  occurrences.occurrence_id = 1;

-- 3. same but with extracted value from occurrences.data
SELECT
  occurrences.occurrence_id,
  json_extract(labelElements.value, '$.type') AS type,
  json_extract(labelElements.value, '$.value') AS value,
  json_extract(occurrences.data, '$.' || json_extract(labelElements.value, '$.value')) AS fieldValue
FROM
  occurrences
  INNER JOIN occurrence_imports ON occurrences.occurrence_import_id = occurrence_imports.occurrence_import_id
  JOIN json_each(occurrence_imports.label_creation) AS labelElements
WHERE
  occurrences.occurrence_id = 1;

-- 4. same but if type is separator, use value, else use value from occurrences.data
SELECT
  occurrences.occurrence_id,
  json_extract(labelElements.value, '$.type') AS type,
  json_extract(labelElements.value, '$.value') AS value,
  iif(json_extract(labelElements.value, '$.type') = 'separator', json_extract(labelElements.value, '$.value'), json_extract(occurrences.data, '$.' || json_extract(labelElements.value, '$.value'))) AS fieldValue
FROM
  occurrences
  INNER JOIN occurrence_imports ON occurrences.occurrence_import_id = occurrence_imports.occurrence_import_id
  JOIN json_each(occurrence_imports.label_creation) AS labelElements
WHERE
  occurrences.occurrence_id = 1;

-- 5. group by occurrence_id and get all label elements
SELECT
  occurrences.occurrence_id,
  json_group_array(iif(json_extract(labelElements.value, '$.type') = 'separator', json_extract(labelElements.value, '$.value'), json_extract(occurrences.data, '$.' || json_extract(labelElements.value, '$.value')))) AS labelArray
FROM
  occurrences
  INNER JOIN occurrence_imports ON occurrences.occurrence_import_id = occurrence_imports.occurrence_import_id
  JOIN json_each(occurrence_imports.label_creation) AS labelElements
GROUP BY
  occurrences.occurrence_id
HAVING
  occurrences.occurrence_id = 1;

-- 6. same but join labelArray to string
SELECT
  occurrences.occurrence_id,
  group_concat(iif(json_extract(labelElements.value, '$.type') = 'separator', json_extract(labelElements.value, '$.value'), json_extract(occurrences.data, '$.' || json_extract(labelElements.value, '$.value'))), '') AS label
FROM
  occurrences
  INNER JOIN occurrence_imports ON occurrences.occurrence_import_id = occurrence_imports.occurrence_import_id
  JOIN json_each(occurrence_imports.label_creation) AS labelElements
GROUP BY
  occurrences.occurrence_id
HAVING
  occurrences.occurrence_id = 1;

-- 7. update label with label
UPDATE
  occurrences
SET
  label =(
    SELECT
      group_concat(iif(json_extract(labelElements.value, '$.type') = 'separator', json_extract(labelElements.value, '$.value'), json_extract(occurrences.data, '$.' || json_extract(labelElements.value, '$.value'))), '')
    FROM
      occurrences
      INNER JOIN occurrence_imports ON occurrences.occurrence_import_id = occurrence_imports.occurrence_import_id
      JOIN json_each(occurrence_imports.label_creation) AS labelElements
    WHERE
      occurrence_imports.occurrence_import_id = occurrences.occurrence_import_id
    GROUP BY
      occurrences.occurrence_id)
WHERE
  occurrences.occurrence_id = 1;

-- 8. Same for trigger
UPDATE
  occurrences
SET
  label =(
    SELECT
      group_concat(iif(json_extract(labelElements.value, '$.type') = 'separator', json_extract(labelElements.value, '$.value'), json_extract(occurrences.data, '$.' || json_extract(labelElements.value, '$.value'))), '')
    FROM
      occurrences
      INNER JOIN occurrence_imports ON occurrences.occurrence_import_id = occurrence_imports.occurrence_import_id
      JOIN json_each(occurrence_imports.label_creation) AS labelElements
    WHERE
      occurrence_imports.occurrence_import_id = occurrences.occurrence_import_id
    GROUP BY
      occurrences.occurrence_id)
WHERE
  occurrences.occurrence_id = NEW.occurrence_id;

