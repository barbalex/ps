export const generateWidgetForFieldLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(widgets_for_fields)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE widgets_for_fields ADD COLUMN label text GENERATED ALWAYS AS (widget_for_field_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS widgets_for_fields_label_idx ON widgets_for_fields(label)',
    })
  }
  // console.log('LabelGenerator, widgets_for_fields:', {
  //   columns,
  //   hasLabel,
  //   indexes,
  // })
}
