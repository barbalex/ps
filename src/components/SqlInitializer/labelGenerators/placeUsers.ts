export const generatePlaceUserLabel = async (db) => {
  // if user_id or role is changed, update label with email from users and with role
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const placeUsersLabelTriggerExists = triggers.some(
    (column) => column.name === 'place_users_label_trigger',
  )
  if (!placeUsersLabelTriggerExists) {
    const result = await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS place_users_label_trigger
        AFTER UPDATE OF user_id, role ON place_users
      BEGIN
        UPDATE place_users SET label = (SELECT email FROM users WHERE user_id = NEW.user_id) || ' (' || NEW.role || ')';
      END;`,
    })
    console.log('TriggerGenerator, place_users, result:', result)
  }
  const placeUsersLabelInsertTriggerExists = triggers.some(
    (column) => column.name === 'place_users_label_trigger_insert',
  )
  if (!placeUsersLabelInsertTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS place_users_label_trigger_insert
        AFTER INSERT ON place_users
      BEGIN
        UPDATE place_users SET label = NEW.place_user_id;
      END;`,
    })
  }
}
