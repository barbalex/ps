export const generateOccurrenceImportLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(occurrence_imports)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE occurrence_imports ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, occurrence_import_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS occurrence_imports_label_idx ON occurrence_imports(label)',
    })
  }
  // drop label_replace_by_generated_column if it exists
  // const hasLabelReplaceByGeneratedColumn = columns.some(
  //   (column) => column.name === 'label_replace_by_generated_column',
  // )
  // if (hasLabelReplaceByGeneratedColumn) {
  //   const result = await db.unsafeExec({
  //     sql: 'ALTER TABLE occurrence_imports drop COLUMN label_replace_by_generated_column;',
  //   })
  //   console.log(
  //     'LabelGenerator, occurrence_imports_label, result from dropping label_replace_by_generated_column:',
  //     result,
  //   )
  // }
  // when label_creation is changed, update occurrences.label
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })

  const occurrenceImportLabelCreationTriggerExists = triggers.some(
    (column) => column.name === 'occurrence_imports_label_creation_trigger',
  )
  if (!occurrenceImportLabelCreationTriggerExists) {
    await db.unsafeExec({
      sql: `
        CREATE TRIGGER IF NOT EXISTS occurrence_imports_label_creation_trigger
          AFTER update OF label_creation ON occurrence_imports
        BEGIN
          UPDATE occurrences
            SET
              label = (
                SELECT
                  group_concat(iif(json_extract(labelElements.value, '$.type') = 'separator', json_extract(labelElements.value, '$.value'), json_extract(o.data, '$.' || json_extract(labelElements.value, '$.value'))), '')
                FROM
                  occurrences o
                  INNER JOIN occurrence_imports ON o.occurrence_import_id = occurrence_imports.occurrence_import_id
                  JOIN json_each(occurrence_imports.label_creation) AS labelElements
                WHERE
                  o.occurrence_id = occurrences.occurrence_id
                GROUP BY
                  o.occurrence_id)
            WHERE
              occurrences.occurrence_import_id = NEW.occurrence_import_id;
        END;`,
    })
  }
}
