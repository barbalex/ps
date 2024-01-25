// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generateGoalReportValueLabel = async (db) => {
  // when any data is changed, update label using units name
  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const goalReportValuesLabelTriggerExists = triggers.some(
    (column) => column.name === 'goal_report_values_label_trigger',
  )
  if (!goalReportValuesLabelTriggerExists) {
    const result = await db.raw({
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
    console.log('TriggerGenerator, goal_report_values, result:', result)
  }
  const goalReportValuesLabelInsertTriggerExists = triggers.some(
    (column) => column.name === 'goal_report_values_label_insert_trigger',
  )
  if (!goalReportValuesLabelInsertTriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS goal_report_values_label_insert_trigger
        AFTER insert ON goal_report_values
      BEGIN
        UPDATE goal_report_values SET label = NEW.goal_report_value_id;
      END;`,
    })
    console.log('TriggerGenerator, goal_report_values_insert, result:', result)
  }
}
