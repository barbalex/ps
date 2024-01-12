export const generatePlaceReportValueLabel = async (db) => {
  // when any data is changed, update label using units name
  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const placeReportValuesLabelTriggerExists = triggers.some(
    (column) => column.name === 'place_report_values_label_trigger',
  )
  if (!placeReportValuesLabelTriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS place_report_values_label_trigger
        AFTER UPDATE ON place_report_values
      BEGIN
        UPDATE place_report_values SET label = concat(
          units.name,
          ': ',
          coalesce(NEW.value_integer, NEW.value_numeric, NEW.value_text)
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
    console.log('TriggerGenerator, place_report_values, result:', result)
  }
}
