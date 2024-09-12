export const generateUserLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(users)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE users ADD COLUMN label text GENERATED ALWAYS AS (coalesce(email, user_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS users_label_idx ON users(label)',
    })
    console.log('generated user labels')
  }

  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })

  // if email is changed, label of account needs to be updated
  const usersAccountsLabelTriggerExists = triggers.some(
    (column) => column.name === 'users_accounts_label_trigger',
  )
  if (!usersAccountsLabelTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS users_accounts_label_trigger
        AFTER UPDATE OF email ON users
      BEGIN
        UPDATE accounts SET label = NEW.email || ' (' || accounts.type || ')'
        WHERE user_id = NEW.user_id;
      END;`,
    })
  }

  // if email is changed, label of project_user needs to be updated
  const usersProjectUsersLabelTriggerExists = triggers.some(
    (column) => column.name === 'users_project_users_label_trigger',
  )
  if (!usersProjectUsersLabelTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS users_project_users_label_trigger
        AFTER UPDATE OF email ON users
      BEGIN
        UPDATE project_users SET label = NEW.email || ' (' || project_users.role || ')'
        WHERE user_id = NEW.user_id;
      END;`,
    })
  }

  // if email is changed, label of subproject_user needs to be updated
  const usersSubprojectUsersLabelTriggerExists = triggers.some(
    (column) => column.name === 'users_subproject_users_label_trigger',
  )
  if (!usersSubprojectUsersLabelTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS users_subproject_users_label_trigger
        AFTER UPDATE OF email ON users
      BEGIN
        UPDATE subproject_users SET label = NEW.email || ' (' || subproject_users.role || ')'
        WHERE user_id = NEW.user_id;
      END;`,
    })
  }
}
