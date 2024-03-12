export const generateGoalLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(goals)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE goals ADD COLUMN label text GENERATED ALWAYS AS (iif(coalesce(year, name) is not null, year || ': ' || name, goal_id));
        ALTER TABLE goals drop COLUMN label_replace_by_generated_column;`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS goals_label_idx ON goals(label)',
    })
  }
}
