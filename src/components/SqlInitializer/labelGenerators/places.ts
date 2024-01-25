// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
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
        when projects.places_label_by = 'id' then place_id 
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
    // now to same on insert
    const resultInsert = await db.raw({
      sql: `
      CREATE TRIGGER if not exists places_label_insert_trigger
      AFTER INSERT ON places
      BEGIN
        UPDATE places SET label = case 
        when projects.places_label_by is null then place_id 
        when projects.places_label_by = 'id' then place_id 
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
    console.log('LabelGenerator, places, resultInsert:', resultInsert)
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
