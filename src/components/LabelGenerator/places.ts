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
    await db.raw({
      sql: 'ALTER TABLE places ADD COLUMN label text GENERATED ALWAYS AS (place_id)',
    })
    await db.raw({
      sql: `
      CREATE TRIGGER if not exists places_label_trigger
      AFTER UPDATE of data ON places
      BEGIN
        UPDATE places SET label=NEW.data->>projects.places_label_by
         FROM places 
          inner join subprojects on places.subproject_id=subprojects.subproject_id 
          inner join projects on subprojects.project_id=projects.project_id
         WHERE place_id=NEW.place_id;
      END`,
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS places_label_idx ON places(label)',
    })
  }
  // console.log('LabelGenerator, places:', {
  //   columns,
  //   hasLabel,
  // })
}
