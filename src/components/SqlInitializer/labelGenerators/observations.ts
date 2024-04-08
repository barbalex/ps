export const generateObservationLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(observations)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    const result = await db.unsafeExec({
      sql: `
        ALTER TABLE observations ADD COLUMN label text GENERATED ALWAYS AS (coalesce(concat(date, ': ', author), observation_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS observations_label_idx ON observations(label)',
    })
    console.log('LabelGenerator, observations, result:', result)
  }
  // drop label_replace_by_generated_column if it exists
  // const hasLabelReplaceByGeneratedColumn = columns.some(
  //   (column) => column.name === 'label_replace_by_generated_column',
  // )
  // if (hasLabelReplaceByGeneratedColumn) {
  //   const result = await db.unsafeExec({
  //     sql: 'ALTER TABLE observations drop COLUMN label_replace_by_generated_column;',
  //   })
  //   console.log(
  //     'LabelGenerator, observations_label, result from dropping label_replace_by_generated_column:',
  //     result,
  //   )
  // }
}
