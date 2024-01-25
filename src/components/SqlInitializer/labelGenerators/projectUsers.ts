// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generateProjectUserLabel = async (db) => {
  // if user_id is changed, update its label
  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const projectUsersLabelTriggerExists = triggers.some(
    (column) => column.name === 'project_users_label_trigger',
  )
  if (!projectUsersLabelTriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS project_users_label_trigger
        AFTER UPDATE OF user_id, role ON project_users
      BEGIN
        UPDATE project_users SET label = (SELECT email FROM users WHERE user_id = NEW.user_id) || ' (' || NEW.role || ')';
      END;`,
    })
    console.log('TriggerGenerator, project_users, result:', result)
    // same on insert
    await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS project_users_label_trigger_insert
        AFTER INSERT ON project_users
      BEGIN
        UPDATE project_users SET label = NEW.project_user_id;
      END;`,
    })
  }
}
