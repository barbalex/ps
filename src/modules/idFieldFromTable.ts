export const idFieldFromTable = (table: string = ''): string =>
  table.endsWith('taxa')
    ? `${table.slice(0, -1)}on_id`
    : table === 'taxonomies'
    ? 'taxonomy_id'
    : table === 'widgets_for_fields'
    ? 'widget_for_field_id'
    : table === 'root' // not important but seems nicer, else: roo_id
    ? 'root_id'
    : `${table.slice(0, -1)}_id`
