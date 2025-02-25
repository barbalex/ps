export const idFieldFromTable = (table): string => {
  if (!table) return undefined

  // TODO: this causes the warning:
  // Warning: Encountered two children with the same key, `/data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/crs/undefined`. Keys should be unique...
  // /data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/subprojects/018cfd27-ee92-7000-b678-e75497d6c60e/occurrences-to-assess/undefined
  return table.endsWith('taxa')
    ? `${table.slice(0, -1)}on_id`
    : table === 'taxonomies'
    ? 'taxonomy_id'
    : table === 'widgets_for_fields'
    ? 'widget_for_field_id'
    : table === 'root' // not important but seems nicer, else: roo_id
    ? 'project_id'
    : table === 'crs'
    ? 'crs_id'
    : table === 'project_crs'
    ? 'project_crs_id'
    : `${table.slice(0, -1)}_id`
}
