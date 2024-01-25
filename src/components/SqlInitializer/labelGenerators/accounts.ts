// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generateAccountLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(accounts)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE accounts ADD COLUMN label text GENERATED ALWAYS AS (account_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS accounts_label_idx ON accounts(label)',
    })
  }

  // if projects_label_by is changed, need to update all labels of projects
  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const accountsProjectsLabeltriggerExists = triggers.some(
    (column) => column.name === 'accounts_projects_label_trigger',
  )
  if (!accountsProjectsLabeltriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS accounts_projects_label_trigger
        AFTER UPDATE OF projects_label_by ON accounts
      BEGIN
        UPDATE projects SET label = CASE
        WHEN NEW.projects_label_by is null THEN
          name
        WHEN NEW.projects_label_by = 'name' THEN
          name
        ELSE
          json_extract(data, '$.' || NEW.projects_label_by)
        END;
      END;`,
    })
    console.log('TriggerGenerator, accounts, result:', result)
  }
  // own label is updated when user_id or type is changed
  // plus on insert. TODO: what if select is empty?
  const accountsLabelTriggerExists = triggers.some(
    (column) => column.name === 'accounts_label_trigger',
  )
  if (!accountsLabelTriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS accounts_label_trigger
        AFTER UPDATE OF user_id, type ON accounts
      BEGIN
        UPDATE accounts SET label = (SELECT email FROM users WHERE user_id = NEW.user_id) || ' (' || NEW.type || ')';
      END;`,
    })
    const resultInsert = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS accounts_label_insert_trigger
        AFTER insert ON accounts
      BEGIN
        UPDATE accounts SET label = coalesce((SELECT email FROM users WHERE user_id = NEW.user_id), '(no user)') || ' (' || coalesce(NEW.type, 'no type') || ')';
      END;`,
    })
    console.log('TriggerGenerator, accounts, result:', { result, resultInsert })
  }
}
