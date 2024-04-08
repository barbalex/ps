export const generateChartLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(charts)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE charts ADD COLUMN label text GENERATED ALWAYS AS (coalesce(title, chart_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS charts_label_idx ON charts(label)',
    })
  }
}
