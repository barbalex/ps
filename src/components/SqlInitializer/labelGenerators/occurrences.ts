export const generateOccurrenceLabel = async (db) => {
  // when any data is changed, update label using units name
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const occurrenceLabelTriggerExists = triggers.some(
    (column) => column.name === 'occurrences_label_trigger',
  )
  // TODO: update after update of occurrence_imports.label_creation
  if (!occurrenceLabelTriggerExists) {
    const result = await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS occurrences_label_trigger
        AFTER insert ON occurrences
      BEGIN
      UPDATE occurrences
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
      END;`,
    })
    console.log('TriggerGenerator, occurrences, result:', result)
  }
  // TODO: update after insert of occurrence_imports.label_creation
  // const goalReportValuesLabelInsertTriggerExists = triggers.some(
  //   (column) => column.name === 'occurrences_label_insert_trigger',
  // )
  // if (!goalReportValuesLabelInsertTriggerExists) {
  //   const result = await db.unsafeExec({
  //     sql: `
  //     CREATE TRIGGER IF NOT EXISTS occurrences_label_insert_trigger
  //       AFTER insert ON occurrences
  //     BEGIN
  //       UPDATE occurrences SET label = NEW.goal_report_value_id;
  //     END;`,
  //   })
  //   console.log('TriggerGenerator, occurrences_insert, result:', result)
  // }
}
