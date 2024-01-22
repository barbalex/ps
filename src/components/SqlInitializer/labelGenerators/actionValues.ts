export const generateActionValueLabel = async (db) => {
  // when any data is changed, update label using units name
  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const actionValuesLabelTriggerExists = triggers.some(
    (column) => column.name === 'action_values_label_trigger',
  )
  if (!actionValuesLabelTriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS action_values_label_trigger
        AFTER UPDATE ON action_values
      BEGIN
        UPDATE action_values SET label = NEW.action_value_id;
      END;`,
    })
    console.log('TriggerGenerator, action_values, result:', result)
  }
}
