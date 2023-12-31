import { useLiveQuery } from 'electric-sql/react'
import { Link, useLocation } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { idFieldFromTable } from '../../modules/idFieldFromTable'

const isOdd = (num) => num % 2

export const DataNavs = ({ matches }) => {
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
      filterParams.parent_id = null
    } else {
      filterParams[parentIdName] = parentId
    }
  }

  const { db } = useElectric()
  const { results: tableResults } = useLiveQuery(
    () => db[table]?.liveMany({ where: filterParams }),
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
