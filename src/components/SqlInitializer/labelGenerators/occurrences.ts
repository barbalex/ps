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
        UPDATE occurrences SET label = iif(
          occurrence_imports.label_creation is not null,
          -- TODO: loop all labelElements using json_each()
          -- https://www.sqlite.org/json1.html#jeach
          -- then iif type is separator, add value, else add value of json_extract(data, '$.value'):
          concat(
            'TODO:',
            'loop all labelElements and replace with values from occurrences',
            coalesce(NEW.value_integer, NEW.value_numeric, NEW.value_text)
          ),
          NEW.occurrence_id
        ) 
        FROM(
        SELECT
          label_creation
        FROM
          occurrence_imports
        WHERE
          occurrence_import_id = NEW.occurrence_import_id) AS occurrence_imports,
        (
          json_each()
          FROM json_each(occurrence_imports.label_creation)
        ) as labelElements
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
