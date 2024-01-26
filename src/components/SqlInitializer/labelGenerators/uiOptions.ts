export const generateUiOptionLabel = async (db) => {
  // if user_id or role is changed, update label with email from users and with role
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const uiOptionsLabelTriggerExists = triggers.some(
    (column) => column.name === 'ui_options_label_trigger',
  )
  if (!uiOptionsLabelTriggerExists) {
    const result = await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS ui_options_label_trigger
        AFTER UPDATE OF user_id ON ui_options
      BEGIN
        UPDATE ui_options SET label = (SELECT email FROM users WHERE user_id = NEW.user_id);
      END;`,
    })
    console.log('TriggerGenerator, ui_options, result:', result)
    // same on insert
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS ui_options_label_trigger_insert
        AFTER INSERT ON ui_options
      BEGIN
        UPDATE ui_options SET label = NEW.user_id;
      END;`,
    })
  }
}
