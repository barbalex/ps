export const generateActionReportValueLabel = async (db) => {
  // when any data is changed, update label using units name
  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const actionReportValuesLabelTriggerExists = triggers.some(
    (column) => column.name === 'action_report_values_label_trigger',
  )
  if (!actionReportValuesLabelTriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS action_report_values_label_trigger
        AFTER UPDATE ON action_report_values
      BEGIN
        UPDATE action_report_values SET label = concat(
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
          action_report_values.action_report_value_id = NEW.action_report_value_id;
      END;`,
    })
    console.log('TriggerGenerator, action_report_values, result:', result)
  }
}
