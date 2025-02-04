export const generateActionReportValueLabel = async (db) => {
  // when any data is changed, update label using units name
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })

  const actionReportValuesLabelInsertTriggerExists = triggers.some(
    (column) => column.name === 'action_report_values_label_insert_trigger',
  )
  if (!actionReportValuesLabelInsertTriggerExists) {
    const result = await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS action_report_values_label_insert_trigger
        AFTER INSERT ON action_report_values
      BEGIN
        UPDATE action_report_values SET label = NEW.action_report_value_id;
      END;`,
    })
    console.log(
      'TriggerGenerator, action_report_values_insert, result:',
      result,
    )
  }
}
