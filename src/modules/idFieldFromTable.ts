export const idFieldFromTable = (table?: string | null): string => {
  // TODO: this returns undefined for falsy table despite the declared
  // return type; kept as-is to not change behaviour
  if (!table) return undefined as unknown as string

  // TODO: this causes the warning:
  // Warning: Encountered two children with the same key, `/data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/crs/undefined`. Keys should be unique...
  // /data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/subprojects/018cfd27-ee92-7000-b678-e75497d6c60e/observations-to-assess/undefined
  return table.endsWith('taxa')
    ? `${table.slice(0, -1)}onId`
    : table === 'taxonomies'
      ? 'taxonomyId'
      : table === 'widgets_for_fields'
        ? 'widgetForFieldId'
        : table === 'root' // not important but seems nicer, else: roo_id
          ? 'projectId'
          : table === 'crs'
            ? 'crsId'
            : table === 'project_crs'
              ? 'projectCrsId'
              : `${table.slice(0, -1)}Id`
}
