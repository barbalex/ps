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
  const triggerExists = triggers.some(
    (column) => column.name === 'accounts_projects_label_trigger',
  )
  if (!triggerExists) {
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
}
