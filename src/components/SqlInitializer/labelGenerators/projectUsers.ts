export const generateProjectUserLabel = async (db) => {
  // if user_id is changed, update its label
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const projectUsersLabelTriggerExists = triggers.some(
    (column) => column.name === 'project_users_label_trigger',
  )
  if (!projectUsersLabelTriggerExists) {
    const result = await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS project_users_label_trigger
        AFTER UPDATE OF user_id, role ON project_users
      BEGIN
        UPDATE project_users SET label = (SELECT email FROM users WHERE user_id = NEW.user_id) || ' (' || NEW.role || ')';
      END;`,
    })
    console.log('TriggerGenerator, project_users, result:', result)
    // same on insert
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS project_users_label_trigger_insert
        AFTER INSERT ON project_users
      BEGIN
        UPDATE project_users SET label = NEW.project_user_id;
      END;`,
    })
  }
}
