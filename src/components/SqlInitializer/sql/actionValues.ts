export const generateActionValueLabel = async (db) => {
  // when any data is changed, update label using units name
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const actionValuesLabelTriggerExists = triggers.some(
    (column) => column.name === 'action_values_label_trigger',
  )
  if (!actionValuesLabelTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS action_values_label_trigger
        AFTER UPDATE ON action_values
      BEGIN
        UPDATE action_values SET label = iif(
          units.name is not null,
          concat(
            units.name,
            ': ',
            coalesce(NEW.value_integer, NEW.value_numeric, NEW.value_text)
          ),
          NEW.action_value_id
        ) 
        FROM(
        SELECT
          name
        FROM
          units
        WHERE
          unit_id = NEW.unit_id) AS units
        WHERE
          action_values.action_value_id = NEW.action_value_id;
      END;`,
    })
    console.log('generated action value labels')
  }
  const actionValuesLabelInsertTriggerExists = triggers.some(
    (column) => column.name === 'action_values_label_insert_trigger',
  )
  if (!actionValuesLabelInsertTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS action_values_label_insert_trigger
        AFTER insert ON action_values
      BEGIN
        UPDATE action_values SET label = NEW.action_value_id;
      END;`,
    })
  }
}
