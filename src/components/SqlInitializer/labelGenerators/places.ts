export const generatePlaceLabel = async (db) => {
  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const triggerExists = triggers.some(
    (column) => column.name === 'places_label_trigger',
  )

  if (!triggerExists) {
    // Wanted to build virtual field from projects.places_label_by, return that here
    // But: not possible because generated columns can only fetch from the same row/table
    // Alternative: use a trigger to update the label field
    // TODO: enable using an array of column names
    const result = await db.raw({
      sql: `
      CREATE TRIGGER if not exists places_label_trigger
      AFTER UPDATE of data ON places
      BEGIN
        UPDATE places SET label = json_extract(NEW.data, '$.' || projects.places_label_by)
        FROM (
          SELECT places_label_by from projects 
          where project_id = (select project_id from subprojects where subproject_id = NEW.subproject_id)
        ) as projects
         WHERE places.place_id = NEW.place_id;
      END`,
    })
    console.log('LabelGenerator, places, result:', result)
  }
}
