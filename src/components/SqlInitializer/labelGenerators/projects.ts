export const generateProjectLabel = async (db) => {
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
              UPDATE places SET label = case
                when NEW.places_label_by = 'id' then place_id
                when NEW.places_label_by = 'level' then level
                else json_extract(data, '$.' || NEW.places_label_by)
              end;
            END;`,
    })
    console.log(
      'TriggerGenerator, projects_places_label_trigger, result:',
      result,
    )
  }

  //if anything in projects is changed, update its label
  const projectsLabelTriggerExists = triggers.some(
    (column) => column.name === 'projects_label_trigger',
  )
  if (!projectsLabelTriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS projects_label_trigger
        AFTER UPDATE OF name, data ON projects
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
    // same on insert
    await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS projects_label_trigger_insert
        AFTER INSERT ON projects
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
  }
}
