import { useLiveQuery } from 'electric-sql/react'
import { Link } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { idFieldFromTable } from '../../modules/idFieldFromTable'
import { tablesWithoutDeleted } from '../Breadcrumbs/BreadcrumbForData'

export const DataNavs = ({ matches }) => {
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

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db[table]?.liveMany({ where: filterParams }),
    [db, table],
  )

  console.log('DataNavs', {
    table,
    params,
    idField,
    pathname,
    pathArray,
    parentTable,
    parentId,
    parentIdFieldName,
    results,
  })

  return (
    <nav className="navs">
      {(results ?? []).map((result) => {
        const label = result.label ?? result[idField]

        return (
          <Link key={result[idField]} to={`${pathname}/${result[idField]}`}>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
