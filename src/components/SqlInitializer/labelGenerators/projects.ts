export const generateProjectLabel = async (db) => {
  // const columns = await db.raw({
  //   sql: 'PRAGMA table_xinfo(projects)',
  // })
  // const labelExists = columns.some((column) => column.name === 'label')
  // if (!labelExists) {
  //   await db.raw({
  //     sql: 'ALTER TABLE projects ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, project_id))',
  //   })
  //   await db.raw({
  //     sql: 'CREATE INDEX IF NOT EXISTS projects_label_idx ON projects(label)',
  //   })
  // }
  // if places_label_by is changed, need to update all labels of places
  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const projectsPlacesLabelTriggerExists = triggers.some(
    (column) => column.name === 'projects_places_label_trigger',
  )
  if (!projectsPlacesLabelTriggerExists) {
    const result = await db.raw({
      sql: `CREATE TRIGGER IF NOT EXISTS projects_places_label_trigger
              AFTER UPDATE OF places_label_by ON projects
            BEGIN
              UPDATE places SET label = json_extract(data, '$.' || NEW.places_label_by);
            END;`,
    })
    console.log(
      'TriggerGenerator, projects_places_label_trigger, result:',
      result,
    )
  }

  const projectsLabelTriggerExists = triggers.some(
    (column) => column.name === 'projects_label_trigger',
  )
  if (!projectsLabelTriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS projects_label_trigger
        AFTER UPDATE ON projects
      BEGIN
        UPDATE projects SET label = CASE
        WHEN accounts.projects_label_by IS NULL THEN
          name
          WHEN accounts.projects_label_by = 'name' THEN
          name
        ELSE
          json_extract(NEW.data, '$.' || accounts.projects_label_by)
        END
      FROM(
      SELECT
        projects_label_by
      FROM
        accounts
      WHERE
        account_id = NEW.account_id) AS accounts
      WHERE
        projects.project_id = NEW.project_id;
      END;`,
    })
    console.log('TriggerGenerator, projects_label_trigger, result:', result)
  }
}
