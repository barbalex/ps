import { snakeToCamel } from './snakeToCamel.ts'

const tablesAboveLevel = [
  'projects',
  'subprojects',
  'users',
  'accounts',
  'messages',
  'project_reports',
  'project_users',
  'wms_layers',
  'vector_layers',
  'project_files',
  'subproject_reports',
  'goals',
  'occurrences',
  'subproject_taxa',
  'subproject_users',
  'occurrence_imports',
  'subproject_files',
  'charts',
]

export const filterAtomNameFromTableAndLevel = ({ table, level }) => {
  const useLevel = level && tablesAboveLevel.includes(table)
  const atomName = `${snakeToCamel(table)}${
    useLevel ? `${level}` : ''
  }FilterAtom`
  return atomName
}
