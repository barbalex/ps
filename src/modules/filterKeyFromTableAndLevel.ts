import { snakeToCamel } from './snakeToCamel.ts'

const tablesAbovePlaces = [
  'projects',
  'subprojects',
  'users',
  'lists',
  'units',
  'taxonomies',
  'widget_types',
  'widgets_for_fields',
  'accounts',
  'messages',
  'project_reports',
  'project_users',
  'wfs_services',
  'wms_services',
  'wms_layers',
  'vector_layers',
  'project_files',
  'subproject_reports',
  'goals',
  'observations',
  'subproject_taxa',
  'subproject_roles',
  'observation_imports',
  'subproject_files',
  'charts',
  'project_qcs',
]

export const isTableAbovePlaces = (table: string) =>
  tablesAbovePlaces.includes(table)

export const filterKeyFromTableAndLevel = ({
  table,
  level,
}: {
  table: string
  level?: number
}) => {
  const tableIsAbovePlaces = tablesAbovePlaces.includes(table)
  const useLevel = level && !tableIsAbovePlaces
  const key = `${snakeToCamel(table)}${useLevel ? `${level}` : ''}`
  // console.log('filterKeyFromTableAndLevel', {
  //   table,
  //   key,
  //   tableIsAbovePlaces,
  //   useLevel,
  // })
  return key
}
