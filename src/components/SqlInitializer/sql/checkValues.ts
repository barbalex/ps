export const generateCheckValueLabel = async (db) => {
  // when any data is changed, update label using units name
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const checkValuesLabelTriggerExists = triggers.some(
    (column) => column.name === 'check_values_label_trigger',
  )
  if (!checkValuesLabelTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS check_values_label_trigger
        AFTER UPDATE ON check_values
      BEGIN
        UPDATE check_values SET label = iif(
          units.name is not null,
          concat(
            units.name,
            ': ',
            coalesce(NEW.value_integer, NEW.value_numeric, NEW.value_text)
          ),
          NEW.check_value_id
        ) 
        FROM(
        SELECT
          name
        FROM
          units
        WHERE
          unit_id = NEW.unit_id) AS units
        WHERE
          check_values.check_value_id = NEW.check_value_id;
      END;`,
    })
    console.log('generated check value labels')
  }
  // same on insert
  const checkValuesLabelInsertTriggerExists = triggers.some(
    (column) => column.name === 'check_values_label_insert_trigger',
  )
  if (!checkValuesLabelInsertTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS check_values_label_insert_trigger
        AFTER INSERT ON check_values
      BEGIN
        UPDATE check_values SET label = NEW.check_value_id;
      END;`,
    })
  }
}
