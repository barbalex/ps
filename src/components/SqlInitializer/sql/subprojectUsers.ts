export const generateSubprojectUserLabel = async (db) => {
  // if user_id or role is changed, update label with email from users and with role
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const subprojectUsersLabelTriggerExists = triggers.some(
    (column) => column.name === 'subproject_users_label_trigger',
  )
  if (!subprojectUsersLabelTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS subproject_users_label_trigger
        AFTER UPDATE OF user_id, role ON subproject_users
      BEGIN
        UPDATE subproject_users SET label = (SELECT email FROM users WHERE user_id = NEW.user_id) || ' (' || NEW.role || ')';
      END;`,
    })
    console.log('generated subproject user labels')
  }
  const subprojectUsersLabelInsertTriggerExists = triggers.some(
    (column) => column.name === 'subproject_users_label_trigger_insert',
  )
  if (!subprojectUsersLabelInsertTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS subproject_users_label_trigger_insert
        AFTER INSERT ON subproject_users
      BEGIN
        UPDATE subproject_users SET label = NEW.subproject_user_id;
      END;`,
    })
  }
}
