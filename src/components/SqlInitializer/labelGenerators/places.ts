export const generatePlaceLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(places)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')

  if (!hasLabel) {
    // TODO: build virtual field from projects.places_label_by, return that here
    // But: not possible because generated columns can only fetch from the same row/table
    // Alternatives:
    // - use a trigger to update the label field
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
    console.log('LabelGenerator, places:', {
      result,
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS places_label_idx ON places(label)',
    })
  }
}

// CREATE TRIGGER if not exists places_label_trigger
// AFTER UPDATE of data ON places
// BEGIN
//   UPDATE places SET label_triggered = json_extract(NEW.data, projects.places_label_by)
//   FROM (
//     SELECT places_label_by from projects
//     where project_id = (select project_id from subprojects where subproject_id = NEW.subproject_id)
//   ) as projects
//     WHERE places.place_id = NEW.place_id;
// END
// try with multiple columns:
// CREATE TRIGGER if not exists places_label_trigger
// AFTER UPDATE of data ON places
// BEGIN
//   UPDATE places SET label = json_extract(NEW.data, json_extract(projects.places_label_by, '$'))
//   FROM (
//     SELECT places_label_by from projects
//     where project_id = (select project_id from subprojects where subproject_id = NEW.subproject_id)
//   ) as projects
//     WHERE places.place_id = NEW.place_id;
// END
