export const idFieldFromTable = (table: string): string =>
  table.endsWith('taxa')
    ? `${table.slice(0, -1)}on_id`
    : table === 'taxonomies'
    ? 'taxonomy_id'
    : table === 'field_types'
    ? 'field_type'
    : table === 'widget_types'
    ? 'widget_type'
    : table === 'widgets_for_fields'
    ? 'widget_for_field_id'
    : // : table === 'root'
      // ? 'project_id'
      `${table.slice(0, -1)}_id`
