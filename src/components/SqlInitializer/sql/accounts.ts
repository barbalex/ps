export const generateAccountLabel = async (db) => {
  // if projects_label_by is changed, need to update all labels of projects
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })



  const accountsInsertLabelTriggerExists = triggers.some(
    (column) => column.name === 'accounts_label_insert_trigger',
  )
  if (!accountsInsertLabelTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS accounts_label_insert_trigger
        AFTER insert ON accounts
      BEGIN
        UPDATE accounts SET label = coalesce((SELECT email FROM users WHERE user_id = NEW.user_id), '(no user)') || ' (' || coalesce(NEW.type, 'no type') || ')';
      END;`,
    })
  }
}
