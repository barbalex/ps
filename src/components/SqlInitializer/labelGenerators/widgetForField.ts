// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generateWidgetForFieldLabel = async (db) => {
  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const triggerExists = triggers.some(
    (column) => column.name === 'widgets_for_fields_label_trigger',
  )

  if (!triggerExists) {
    // Wanted to build virtual field from projects.places_label_by, return that here
    // But: not possible because generated columns can only fetch from the same row/table
    // Alternative: use a trigger to update the label field
    // TODO: enable using an array of column names
    const result = await db.raw({
      sql: `
      CREATE TRIGGER if not exists widgets_for_fields_label_trigger
      AFTER UPDATE of field_type_id, widget_type_id ON widgets_for_fields
      BEGIN
        UPDATE widgets_for_fields SET label = (SELECT field_types.name FROM field_types WHERE field_types.field_type_id = NEW.field_type_id) || ': ' || (SELECT widget_types.name FROM widget_types WHERE widget_types.widget_type_id = NEW.widget_type_id)
         WHERE widgets_for_fields.widget_for_field_id = NEW.widget_for_field_id;
      END`,
    })
    console.log('LabelGenerator, widgets for fields, result:', result)
    const resultInsert = await db.raw({
      sql: `
      CREATE TRIGGER if not exists widgets_for_fields_label_insert_trigger
      AFTER insert ON widgets_for_fields
      BEGIN
        UPDATE widgets_for_fields SET label = (SELECT field_types.name FROM field_types WHERE field_types.field_type_id = NEW.field_type_id) || ': ' || (SELECT widget_types.name FROM widget_types WHERE widget_types.widget_type_id = NEW.widget_type_id)
         WHERE widgets_for_fields.widget_for_field_id = NEW.widget_for_field_id;
      END`,
    })
    console.log(
      'LabelGenerator, widgets for fields, resultInsert:',
      resultInsert,
    )
  }
}
