import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { idFieldFromTable } from '../../modules/idFieldFromTable'
import { tablesWithoutDeleted } from '../Breadcrumbs/BreadcrumbForData'

const parentIdNamesOfTables = {
  users: 'root',
  accounts: 'root',
  projects: 'root',
  place_levels: 'project_id',
  subprojects: 'project_id',
  project_users: 'project_id',
  subproject_users: 'subproject_id',
  taxonomies: 'project_id',
  taxa: 'taxonomy_id',
  subproject_taxa: 'subproject_id',
  lists: 'project_id',
  list_values: 'list_id',
  units: 'project_id',
  places: 'subproject_id', // TODO: could also be parent_id
  actions: 'place_id',
  action_values: 'action_id',
  action_reports: 'action_id',
  action_report_values: 'action_report_id',
  checks: 'place_id',
  check_values: 'check_id',
  check_taxa: 'check_id',
  place_reports: 'place_id',
  place_report_values: 'place_report_id',
  observation_sources: 'project_id',
  observations: 'observation_source_id', // TODO: can also be place_id
}

export const DataNavs = ({ matches }) => {
  const filteredMatches = matches.filter((match) => {
    const { table, folder } = match?.handle?.crumb?.(match) ?? {}

    return table !== 'root' && folder === true
  })
  const dataMatch = filteredMatches?.[0] ?? {}
  const { text, table } = dataMatch?.handle?.crumb?.(dataMatch) ?? {}
  const params = dataMatch?.params ?? {}
  const idField = idFieldFromTable(table)

  // filter by parents
  const filterParams = {}
  if (!tablesWithoutDeleted.includes(table)) {
    filterParams.deleted = false
  }

  console.log('DataNavs', { dataMatch, text, table, params, idField })

  return null
}
