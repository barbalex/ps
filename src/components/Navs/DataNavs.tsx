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
  // TODO: for places can also be place_id2
  const parentIdFieldName = parentTable
    ? idFieldFromTable(parentTable)
    : undefined
  const isPlaceId2 = parentTable === 'places' && pathArray.length > 8
  let parentId = params[parentIdFieldName]
  // TODO: where needed use place_id2 instead of place_id
  if (isPlaceId2) {
    parentId = params.place_id2
  }
  const idField = idFieldFromTable(table)

  // filter by parents
  const filterParams = {}
  if (!tablesWithoutDeleted.includes(table)) {
    filterParams.deleted = false
  }
  // if level 2 places, need to filter by parent_id
  const isLevel2Places =
    params.place_id && !params.place_id2 && pathArray.at(-1) === 'places'
  if (isLevel2Places) {
    filterParams.parent_id = params.place_id
  } else if (pathArray.at(-1) === 'places') {
    filterParams.level = 1
  } else if (parentTable && parentId) {
    filterParams[parentIdFieldName] = parentId
  }

  const { db } = useElectric()
  const { results: tableResults } = useLiveQuery(
    () => db[table]?.liveMany({ where: filterParams }),
    [db, location.pathname],
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
  //   tableResults,
  //   filterParams,
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
