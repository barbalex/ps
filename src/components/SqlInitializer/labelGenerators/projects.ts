export const generateProjectLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(projects)',
  })

  const labelExists = columns.some((column) => column.name === 'label')
  if (!labelExists) {
    await db.raw({
      sql: 'ALTER TABLE projects ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, project_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS projects_label_idx ON projects(label)',
    })
  }

  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const triggerExists = triggers.some(
    (column) => column.name === 'projects_places_label_trigger',
  )
  if (!triggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS projects_places_label_trigger
        AFTER UPDATE OF places_label_by ON projects
      BEGIN
        UPDATE places SET label = json_extract(data, '$.' || NEW.places_label_by);
      END;
`,
    })
    console.log('TriggerGenerator, projects, result:', result)
  }
}
