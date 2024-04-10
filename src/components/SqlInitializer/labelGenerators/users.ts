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
  }

  // on insert an app_state needs to be created
  // ISSUE: this does not work
  // reason: electric-sql needs a string id that is unique
  // but the app has to create it
  // https://electric-sql.com/docs/usage/data-modelling/types#primary-keys
  // SOLUTION: added this on create user
  // const usersAppStateTriggerExists = triggers.some(
  //   (column) => column.name === 'users_app_state_trigger',
  // )
  // if (!usersAppStateTriggerExists) {
  //   const result = await db.unsafeExec({
  //     sql: `
  //     CREATE TRIGGER IF NOT EXISTS users_app_state_trigger
  //       AFTER INSERT ON users
  //     BEGIN
  //       INSERT INTO app_states (app_state_id, user_id, user_email, designing, breadcrumbs_overflowing, navs_overflowing, tabs)
  //       VALUES ('${uuidv7()}', NEW.user_id, NEW.email, false, true, true, '["tree","data"]');
  //     END;`,
  //   })
  //   console.log(
  //     'hello TriggerGenerator, users_app_state_trigger, result:',
  //     result,
  //   )
  // }

  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })

  // if email is changed, label of account needs to be updated
  const usersAccountsLabelTriggerExists = triggers.some(
    (column) => column.name === 'users_accounts_label_trigger',
  )
  if (!usersAccountsLabelTriggerExists) {
    const result = await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS users_accounts_label_trigger
        AFTER UPDATE OF email ON users
      BEGIN
        UPDATE accounts SET label = NEW.email || ' (' || accounts.type || ')'
        WHERE user_id = NEW.user_id;
      END;`,
    })
    console.log(
      'TriggerGenerator, users_accounts_label_trigger, result:',
      result,
    )
  }
  // if email is changed, app_states.user_email needs to be updated
  // TODO: this causes error when user is changed
  // Error: cannot rollback - no transaction is active
  // Seems that electric-sql or sqlite do not support updating another tables primary key? https://github.com/electric-sql/electric/issues/1134
  // PROBLEM: email is pk in app_states because findFirst in electric-sql re-renders perpetually
  // circumvention: create new row from copying data then delete old one - nope: same error!
  const usersAppStatesEmailTriggerExists = triggers.some(
    (column) => column.name === 'users_app_states_email_trigger',
  )
  if (!usersAppStatesEmailTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS users_app_states_email_trigger
        AFTER UPDATE OF email ON users
      BEGIN
        UPDATE app_states SET user_email = NEW.email
        WHERE user_id = NEW.user_id;
      END;`,
    })
  }

  // if email is changed, label of project_user needs to be updated
  const usersProjectUsersLabelTriggerExists = triggers.some(
    (column) => column.name === 'users_project_users_label_trigger',
  )
  if (!usersProjectUsersLabelTriggerExists) {
    const result = await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS users_project_users_label_trigger
        AFTER UPDATE OF email ON users
      BEGIN
        UPDATE project_users SET label = NEW.email || ' (' || project_users.role || ')'
        WHERE user_id = NEW.user_id;
      END;`,
    })
    console.log(
      'TriggerGenerator, users_project_users_label_trigger, result:',
      result,
    )
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
