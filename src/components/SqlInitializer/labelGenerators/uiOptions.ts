// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generateUiOptionLabel = async (db) => {
  // if user_id or role is changed, update label with email from users and with role
  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const uiOptionsLabelTriggerExists = triggers.some(
    (column) => column.name === 'ui_options_label_trigger',
  )
  if (!uiOptionsLabelTriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS ui_options_label_trigger
        AFTER UPDATE OF user_id ON ui_options
      BEGIN
        UPDATE ui_options SET label = (SELECT email FROM users WHERE user_id = NEW.user_id);
      END;`,
    })
    console.log('TriggerGenerator, ui_options, result:', result)
    // same on insert
    await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS ui_options_label_trigger_insert
        AFTER INSERT ON ui_options
      BEGIN
        UPDATE ui_options SET label = NEW.user_id;
      END;`,
    })
  }
}
