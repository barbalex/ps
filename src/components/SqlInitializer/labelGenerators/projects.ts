export const generateProjectLabel = async (db) => {
  // if places_label_by is changed, need to update all labels of places
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const projectsPlacesLabelTriggerExists = triggers.some(
    (column) => column.name === 'projects_places_label_trigger',
  )
  if (!projectsPlacesLabelTriggerExists) {
    const result = await db.unsafeExec({
      sql: `CREATE TRIGGER IF NOT EXISTS projects_places_label_trigger
              AFTER UPDATE OF places_label_by ON projects
            BEGIN
              UPDATE places SET label = case
                when NEW.places_label_by = 'id' then place_id
                when NEW.places_label_by = 'level' then level
                else ifnull(json_extract(data, '$.' || NEW.places_label_by), place_id)
              end;
            END;`,
    })
    console.log(
      'TriggerGenerator, projects_places_label_trigger, result:',
      result,
    )
  }

  // if goals_label_by is changed, need to update all labels of goals
  const projectsGoalsLabelTriggerExists = triggers.some(
    (column) => column.name === 'projects_goals_label_trigger',
  )
  if (!projectsGoalsLabelTriggerExists) {
    const result = await db.unsafeExec({
      sql: `CREATE TRIGGER IF NOT EXISTS projects_goals_label_trigger
              AFTER UPDATE OF goals_label_by ON projects
            BEGIN
              UPDATE goals SET label = case
                when NEW.goals_label_by = 'id' then goal_id
                else ifnull(json_extract(data, '$.' || NEW.goals_label_by), goal_id)
              end;
            END;`,
    })
    console.log(
      'TriggerGenerator, projects_goals_label_trigger, result:',
      result,
    )
  }

  // if anything in projects is changed, update its label
  const projectsLabelTriggerExists = triggers.some(
    (column) => column.name === 'projects_label_trigger',
  )
  if (!projectsLabelTriggerExists) {
    const result = await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS projects_label_trigger
        AFTER UPDATE OF name, data ON projects
      BEGIN
        UPDATE projects SET label = CASE
          WHEN accounts.projects_label_by IS NULL THEN name
          WHEN accounts.projects_label_by = 'name' THEN name
          ELSE ifnull(json_extract(NEW.data, '$.' || accounts.projects_label_by), project_id)
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
  const projectsLabelInsertTriggerExists = triggers.some(
    (column) => column.name === 'projects_label_trigger_insert',
  )
  if (!projectsLabelInsertTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS projects_label_trigger_insert
        AFTER INSERT ON projects
      BEGIN
        UPDATE projects SET label = CASE 
          WHEN accounts.projects_label_by IS NULL THEN ifnull(name, project_id)
          WHEN accounts.projects_label_by = 'name' THEN ifnull(name, project_id)
          ELSE ifnull(json_extract(NEW.data, '$.' || accounts.projects_label_by), project_id)
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
