import { useLiveQuery } from 'electric-sql/react'
import { useLocation } from 'react-router-dom'

import { useElectric } from '../../../../ElectricProvider'
import { idFieldFromTable } from '../../../../modules/idFieldFromTable'
import { Nav } from '../Nav'

const isOdd = (num) => num % 2

// Datanavas need to query db
// so need to be in a separate component
export const DataNavsOverflowing = ({ matches }) => {
  const location = useLocation()

  const filteredMatches = matches.filter((match) => {
    const { table, folder } = match?.handle?.crumb?.(match) ?? {}

    return table !== 'root' && folder === true
  })
  const dataMatch = filteredMatches?.[0] ?? {}
  const { table } = dataMatch?.handle?.crumb?.(dataMatch) ?? {}
  const pathname = dataMatch?.pathname ?? ''
  const path = pathname.split('/').filter((path) => path !== '')
  const idField = idFieldFromTable(table)

  const filterParams = {}
  // Add only the last to the filter
  // Wanted to get it from params. But not useable because also contains lower level ids!!!
  // so need to get it from path which does NOT contain lower levels
  // if length is divisable by two, then it is a parent id
  const indexOfParentId =
    path.length > 1
      ? isOdd(path.length)
        ? path.length - 2
        : path.length - 1
      : undefined
  const parentId = indexOfParentId ? path[indexOfParentId] : undefined
  // need to get the name from the parents as in path is altered
  // for instance: place_report_values > values
  const parentIdName = Object.keys(dataMatch.params ?? {})
    .find((key) => dataMatch.params[key] === parentId)
    ?.replace('place_id2', 'place_id')
  const placesCountInPath = path.filter((p) => p.includes('places')).length
  if (parentIdName && parentId) {
    if (table === 'places' && placesCountInPath === 2) {
      filterParams.parent_id = dataMatch?.params?.place_id
    } else if (table === 'places') {
      filterParams[parentIdName] = parentId
      filterParams.parent_id = null
    } else {
      filterParams[parentIdName] = parentId
    }
  }
  // fields exist in root and in projects
  if (table === 'fields' && !parentId) {
    filterParams.project_id = null
  }

  const { db } = useElectric()
  const { results: tableResults = [] } = useLiveQuery(
    () =>
      db[table]?.liveMany({ where: filterParams, orderBy: { label: 'asc' } }),
    [db, location.pathname],
  )

  // console.log('DataNavs', {
  //   table,
  //   idField,
  //   pathname,
  //   parentId,
  //   tableResults,
  //   filterParams,
  // })

  if (!table) return null

  return tableResults.map((result) => {
    const value = result[idField]
    const label = result.label ?? value

    return <Nav key={value} label={label} to={`${pathname}/${value}`} />
  })
}
