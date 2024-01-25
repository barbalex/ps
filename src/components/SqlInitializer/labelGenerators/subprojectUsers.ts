// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generateSubprojectUserLabel = async (db) => {
  // if user_id or role is changed, update label with email from users and with role
  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const subprojectUsersLabelTriggerExists = triggers.some(
    (column) => column.name === 'subproject_users_label_trigger',
  )
  if (!subprojectUsersLabelTriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS subproject_users_label_trigger
        AFTER UPDATE OF user_id, role ON subproject_users
      BEGIN
        UPDATE subproject_users SET label = (SELECT email FROM users WHERE user_id = NEW.user_id) || ' (' || NEW.role || ')';
      END;`,
    })
    console.log('TriggerGenerator, subproject_users, result:', result)
    // same on insert
    await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS subproject_users_label_trigger_insert
        AFTER INSERT ON subproject_users
      BEGIN
        UPDATE subproject_users SET label = NEW.subproject_user_id;
      END;`,
    })
  }
}
