export const generateChartSubjectLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(chart_subjects)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  console.log('LabelGenarator, chart_subjects, hasLabel:', hasLabel)
  if (!hasLabel) {
    let res
    try {
      res = await db.unsafeExec({
        sql: `ALTER TABLE chart_subjects ADD COLUMN label text GENERATED ALWAYS AS (
                iif(
                  name is not null, 
                  name,
                  iif(
                    value_unit is not null, 
                    concat(table_name, ', ', value_source, ', ', value_field, ', ', value_unit), 
                    iif(
                      value_field is not null, 
                      concat(table_name, ', ', value_source, ', ', value_field), 
                      iif(
                        value_source is not null, 
                        concat(table_name, ', ', value_source), 
                        iif(table_name is not null, table_name, chart_subject_id)
                      )
                    )
                  )
                )
              );`,
      })
      console.log('LabelGenarator, chart_subjects, result:', res)
    } catch (error) {
      console.error('LabelGenarator, chart_subjects, error:', error)
    }

    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS chart_subjects_label_idx ON chart_subjects(label)',
    })
  }
}
