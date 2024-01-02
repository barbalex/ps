import { useLiveQuery } from 'electric-sql/react'
import { Link, useLocation } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { idFieldFromTable } from '../../modules/idFieldFromTable'
import { tablesWithoutDeleted } from '../Breadcrumbs/BreadcrumbForData'

export const DataNavs = ({ matches }) => {
  const location = useLocation()

  const filteredMatches = matches.filter((match) => {
    const { table, folder } = match?.handle?.crumb?.(match) ?? {}

    return table !== 'root' && folder === true
  })
  const dataMatch = filteredMatches?.[0] ?? {}
  const { table } = dataMatch?.handle?.crumb?.(dataMatch) ?? {}
  const params = dataMatch?.params ?? {}
  const pathname = dataMatch?.pathname ?? ''
  const pathArray = pathname.split('/').filter((path) => path !== '')
  const parentTable = pathArray?.[pathArray.length - 3]
  const parentIdFieldName = parentTable
    ? idFieldFromTable(parentTable)
    : undefined
  const parentId = params[parentIdFieldName]
  const idField = idFieldFromTable(table)

  // filter by parents
  const filterParams = {}
  if (!tablesWithoutDeleted.includes(table)) {
    filterParams.deleted = false
  }
  if (parentTable && parentId) {
    filterParams[parentIdFieldName] = params[parentIdFieldName]
  }

  // TODO:
  // if table === 'places'
  // include subproject > project > place_levels
  // to:
  // 1. know how to label places?
  // 2. know if second level exists
  const { db } = useElectric()
  const { results: tableResults } = useLiveQuery(
    () => db[table]?.liveMany({ where: filterParams }),
    [db, location.pathname],
  )
  const project_id = params.project_id ?? '99999999-9999-9999-9999-999999999999'
  const { results: levelResults } = useLiveQuery(
    () => db.place_levels?.liveMany({ where: { project_id } }),
    [db, project_id],
  )
  

  // console.log('DataNavs', {
  //   table,
  //   params,
  //   idField,
  //   pathname,
  //   pathArray,
  //   parentTable,
  //   parentId,
  //   parentIdFieldName,
  //   results,
  // })

  return (
    <nav className="navs">
      {(tableResults ?? []).map((result, index) => {
        const label = result.label ?? result[idField]

        return (
          <Link
            key={`${result[idField]}/${index}`}
            to={`${pathname}/${result[idField]}`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
