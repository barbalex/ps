export const generateAccountLabel = async (db) => {
  // if projects_label_by is changed, need to update all labels of projects
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const accountsProjectsLabeltriggerExists = triggers.some(
    (column) => column.name === 'accounts_projects_label_trigger',
  )
  if (!accountsProjectsLabeltriggerExists) {
    const result = await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS accounts_projects_label_trigger
        AFTER UPDATE OF projects_label_by ON accounts
      BEGIN
        UPDATE projects SET label = CASE
        WHEN NEW.projects_label_by is null THEN name
        WHEN NEW.projects_label_by = 'name' THEN name
        ELSE ifnull(json_extract(data, '$.' || NEW.projects_label_by), project_id)
        END;
      END;`,
    })
    console.log('TriggerGenerator, accounts, result:', result)
  }
  // own label is updated when user_id or type is changed
  // plus on insert. TODO: what if select is empty?
  const accountsUpdateLabelTriggerExists = triggers.some(
    (column) => column.name === 'accounts_label_trigger',
  )
  if (!accountsUpdateLabelTriggerExists) {
    const result = await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS accounts_label_trigger
        AFTER UPDATE OF user_id, type ON accounts
      BEGIN
        UPDATE accounts SET label = (SELECT email FROM users WHERE user_id = NEW.user_id) || ' (' || NEW.type || ')';
      END;`,
    })
    console.log('TriggerGenerator, accounts, result:', result)
  }
  const accountsInsertLabelTriggerExists = triggers.some(
    (column) => column.name === 'accounts_label_insert_trigger',
  )
  if (!accountsInsertLabelTriggerExists) {
    const resultInsert = await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS accounts_label_insert_trigger
        AFTER insert ON accounts
      BEGIN
        UPDATE accounts SET label = coalesce((SELECT email FROM users WHERE user_id = NEW.user_id), '(no user)') || ' (' || coalesce(NEW.type, 'no type') || ')';
      END;`,
    })
    console.log('TriggerGenerator, insert accounts, result:', resultInsert)
  }
}
