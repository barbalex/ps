// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
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
    console.log('TriggerGenerator, check_values, result:', result)
  }
  // same on insert
  const checkValuesLabelInsertTriggerExists = triggers.some(
    (column) => column.name === 'check_values_label_insert_trigger',
  )
  if (!checkValuesLabelInsertTriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS check_values_label_insert_trigger
        AFTER INSERT ON check_values
      BEGIN
        UPDATE check_values SET label = NEW.check_value_id;
      END;`,
    })
    console.log('TriggerGenerator, check_values_insert, result:', result)
  }
}
