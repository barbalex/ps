export const generateAppStatesLabel = async (db) => {
  // if user_id or role is changed, update label with email from users and with role
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const uiOptionsLabelTriggerExists = triggers.some(
    (column) => column.name === 'ui_options_label_trigger',
  )
  if (!uiOptionsLabelTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS ui_options_label_trigger
        AFTER UPDATE OF user_id ON app_states
      BEGIN
        UPDATE app_states SET label = (SELECT email FROM users WHERE user_id = NEW.user_id);
      END;`,
    })
    console.log('generated app state labels')
  }
  const uiOptionsLabelInsertTriggerExists = triggers.some(
    (column) => column.name === 'ui_options_label_trigger_insert',
  )
  if (!uiOptionsLabelInsertTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS ui_options_label_trigger_insert
        AFTER INSERT ON app_states
      BEGIN
        UPDATE app_states SET label = coalesce(new.user_email, new.app_state_id);
      END;`,
    })
  }
}
