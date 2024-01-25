// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generatePlaceLevelLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(place_levels)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: `ALTER TABLE place_levels ADD COLUMN label text GENERATED ALWAYS AS (coalesce(CAST(level as VARCHAR) || '.' || coalesce(name_short, name_plural, place_level_id), place_level_id))`,
    })
    // await db.raw({
    //   sql: `ALTER TABLE place_levels ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name_plural, place_level_id))`,
    // })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS place_levels_label_idx ON place_levels(label)',
    })
  }
}
