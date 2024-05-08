export const generatePlaceReportValueLabel = async (db) => {
  // when any data is changed, update label using units name
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const placeReportValuesLabelTriggerExists = triggers.some(
    (column) => column.name === 'place_report_values_label_trigger',
  )
  if (!placeReportValuesLabelTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS place_report_values_label_trigger
        AFTER UPDATE ON place_report_values
      BEGIN
        UPDATE place_report_values SET label = iif(
          units.name is not null,
          concat(
            units.name,
            ': ',
            coalesce(NEW.value_integer, NEW.value_numeric, NEW.value_text)
          ),
          NEW.place_report_value_id
        ) 
        FROM(
        SELECT
          name
        FROM
          units
        WHERE
          unit_id = NEW.unit_id) AS units
        WHERE
          place_report_values.place_report_value_id = NEW.place_report_value_id;
      END;`,
    })
    console.log('generated place report value labels')
  }
  const placeReportValuesLabelInsertTriggerExists = triggers.some(
    (column) => column.name === 'place_report_values_label_insert_trigger',
  )
  if (!placeReportValuesLabelInsertTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS place_report_values_label_insert_trigger
        AFTER insert ON place_report_values
      BEGIN
        UPDATE place_report_values SET label = NEW.place_report_value_id;
      END;`,
    })
  }
}
