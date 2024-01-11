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
      AFTER UPDATE of level, data ON places
      BEGIN
        UPDATE places SET label = case 
        when projects.places_label_by is null then place_id 
        when projects.places_label_by = 'level' then level 
        else json_extract(NEW.data, '$.' || projects.places_label_by) 
        end
        FROM (
          SELECT places_label_by from projects 
          where project_id = (select project_id from subprojects where subproject_id = NEW.subproject_id)
        ) as projects
         WHERE places.place_id = NEW.place_id;
      END`,
    })
    console.log('LabelGenerator, places, result:', result)
    // const resultArray = await db.raw({
    //   sql: `
    //   CREATE TRIGGER if not exists places_label_array_trigger
    //   AFTER UPDATE of data ON places
    //   BEGIN
    //     UPDATE places SET label_array = '$.' || group_concat(json_extract(NEW.data, projects.places_label_by_array), '.')
    //     FROM (
    //       SELECT places_label_by_array from projects
    //       where project_id = (select project_id from subprojects where subproject_id = NEW.subproject_id)
    //     ) as projects
    //      WHERE places.place_id = NEW.place_id;
    //   END`,
    // })
    // console.log('LabelGenerator, places, resultArray:', resultArray)
  }
}
