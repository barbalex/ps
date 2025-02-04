export const generateProjectLabel = async (db) => {
  // if places_label_by is changed, need to update all labels of places
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })

  // if anything in projects is changed, update its label
  const projectsLabelTriggerExists = triggers.some(
    (column) => column.name === 'projects_label_trigger',
  )
  if (!projectsLabelTriggerExists) {
    await db.unsafeExec({
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
  // when a project is inserted, vector_layers and vector_layer_displays need to be created
  // for: places1, places2, actions1, actions2, checks1, checks2, occurrences_assigned1, occurrences_assigned2, occurrences_to_assess, occurrences_not_to_assign
  // ISSUE: how to create v7 uuids? https://github.com/rhashimoto/wa-sqlite/discussions/169, https://github.com/craigpastro/sqlite-uuidv7/issues/3
  // TODO: solve
  // const projectsInsertTriggerExists = triggers.some(
  //   (column) => column.name === 'projects_insert_trigger',
  // )
  // if (!projectsInsertTriggerExists) {
  //   await db.unsafeExec({
  //     sql: `
  //     CREATE TRIGGER IF NOT EXISTS projects_insert_trigger
  //       AFTER INSERT ON projects
  //     BEGIN
  //       INSERT INTO vector_layers (project_id, type, label)
  //       VALUES
  //         (NEW.project_id, 'places1', 'Places'),
  //         (NEW.project_id, 'places2', 'Places'),
  //         (NEW.project_id, 'actions1', 'Actions'),
  //         (NEW.project_id, 'actions2', 'Actions'),
  //         (NEW.project_id, 'checks1', 'Checks'),
  //         (NEW.project_id, 'checks2', 'Checks'),
  //         (NEW.project_id, 'occurrences_assigned1', 'Occurrences assigned level 1'),
  //         (NEW.project_id, 'occurrences_assigned2', 'Occurrences assigned level 2'),
  //         (NEW.project_id, 'occurrences_to_assess', 'Occurrences to assess'),
  //         (NEW.project_id, 'occurrences_not_to_assign', 'Occurrences not to assign');
  //       INSERT INTO vector_layer_displays (vector_layer_id)
  //       SELECT vector_layer_id
  //       FROM vector_layers
  //       WHERE project_id = NEW.project_id;
  //     END;`,
  //   })
  // }
}
