export const generateGoalReportValueLabel = async (db) => {
  // when any data is changed, update label using units name
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const goalReportValuesLabelTriggerExists = triggers.some(
    (column) => column.name === 'goal_report_values_label_trigger',
  )
  if (!goalReportValuesLabelTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS goal_report_values_label_trigger
        AFTER UPDATE ON goal_report_values
      BEGIN
        UPDATE goal_report_values SET label = iif(
          units.name is not null,
          concat(
            units.name,
            ': ',
            coalesce(NEW.value_integer, NEW.value_numeric, NEW.value_text)
          ),
          NEW.goal_report_value_id
        ) 
        FROM(
        SELECT
          name
        FROM
          units
        WHERE
          unit_id = NEW.unit_id) AS units
        WHERE
          goal_report_values.goal_report_value_id = NEW.goal_report_value_id;
      END;`,
    })
    console.log('generated goal report value labels')
  }
  const goalReportValuesLabelInsertTriggerExists = triggers.some(
    (column) => column.name === 'goal_report_values_label_insert_trigger',
  )
  if (!goalReportValuesLabelInsertTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS goal_report_values_label_insert_trigger
        AFTER insert ON goal_report_values
      BEGIN
        UPDATE goal_report_values SET label = NEW.goal_report_value_id;
      END;`,
    })
  }
}
