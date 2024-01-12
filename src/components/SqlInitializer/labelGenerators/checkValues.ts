export const generateCheckValueLabel = async (db) => {
  // when any data is changed, update label using units name
  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const checkValuesLabelTriggerExists = triggers.some(
    (column) => column.name === 'check_values_label_trigger',
  )
  if (!checkValuesLabelTriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS check_values_label_trigger
        AFTER UPDATE ON check_values
      BEGIN
        UPDATE check_values SET label = concat(
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
          check_values.check_value_id = NEW.check_value_id;
      END;`,
    })
    console.log('TriggerGenerator, check_values, result:', result)
  }
}
