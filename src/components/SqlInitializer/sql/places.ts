export const generatePlaceLabel = async (db) => {
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const updateTriggerExists = triggers.some(
    (column) => column.name === 'places_label_trigger',
  )
  if (!updateTriggerExists) {
    // Wanted to build virtual field from projects.places_label_by, return that here
    // But: not possible because generated columns can only fetch from the same row/table
    // Alternative: use a trigger to update the label field
    // TODO: enable using an array of column names
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER if not exists places_label_trigger
      AFTER UPDATE of level, data ON places
      BEGIN
        UPDATE places SET label = 
        case 
          when projects.places_label_by is null then place_id 
          when projects.places_label_by = 'id' then place_id 
          when projects.places_label_by = 'level' then level 
          else ifnull(json_extract(NEW.data, '$.' || projects.places_label_by), place_id)
        end
        FROM (
          SELECT places_label_by from projects 
          where project_id = (select project_id from subprojects where subproject_id = NEW.subproject_id)
        ) as projects
         WHERE places.place_id = NEW.place_id;
      END;`,
    })
    console.log('generated place labels')
  }
  // if no insert trigger exists, add it
  const insertTriggerExists = triggers.some(
    (column) => column.name === 'places_label_insert_trigger',
  )
  if (!insertTriggerExists) {
    try {
      await db.unsafeExec({
        sql: `
      CREATE TRIGGER if not exists places_label_insert_trigger
      AFTER INSERT ON places
      BEGIN
        UPDATE places SET label = case 
        when projects.places_label_by is null then place_id 
        when projects.places_label_by = 'id' then place_id 
        when projects.places_label_by = 'level' then level 
        else ifnull(json_extract(NEW.data, '$.' || projects.places_label_by), place_id)
        end
        FROM (
          SELECT places_label_by from projects 
          where project_id = (select project_id from subprojects where subproject_id = NEW.subproject_id)
        ) as projects
         WHERE places.place_id = NEW.place_id;
      END;`,
      })
    } catch (error) {
      console.error('LabelGenerator, places, error:', error)
    }
  }
}
