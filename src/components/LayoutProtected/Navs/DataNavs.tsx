import { memo, useState, useEffect, useMemo } from 'react'
import { useLocation } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { idFieldFromTable } from '../../../modules/idFieldFromTable.ts'
import { Nav } from './Nav.tsx'

export const DataNavs = memo(({ matches }) => {
  const location = useLocation()
  const db = usePGlite()

  const filteredMatches = useMemo(
    () =>
      matches.filter((match) => {
        const { table, folder } = match?.handle?.crumb ?? {}

        return table !== 'root' && folder === true
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname],
  )
  const dataMatch = filteredMatches?.[0] ?? {}
  const { table } = dataMatch?.handle?.crumb ?? {}
  const pathname = dataMatch?.pathname ?? ''
  const path = pathname.split('/').filter((path) => path !== '')
  const idField = idFieldFromTable(table)

  const [occurrenceImportIds, setOccurrenceImportIds] = useState([])
  useEffect(() => {
    const get = async () => {
      switch (table) {
        case 'occurrences': {
          if (!dataMatch?.params?.subproject_id) return
          const occurrenceImports = await db.occurrence_imports?.findMany({
            where: { subproject_id: dataMatch.params.subproject_id },
          })
          setOccurrenceImportIds(
            occurrenceImports.map((o) => o.occurrence_import_id),
          )
          break
        }
        default:
          break
      }
    }
    get()
  }, [dataMatch?.params?.subproject_id, db.occurrence_imports, table])

  const filterParams = useMemo(() => {
    const filterParams = {}
    // Add only the last to the filter
    // Wanted to get it from params. But not useable because also contains lower level ids!!!
    // so need to get it from path which does NOT contain lower levels
    // if length is divisable by two, then it is a parent id
    const indexOfParentId = path.length - 2
    const parentId = indexOfParentId ? path[indexOfParentId] : undefined
    // need to get the name from the parents as in path is altered
    // for instance: place_report_values > values
    const parentIdName = Object.keys(dataMatch.params ?? {})
      .find((key) => dataMatch.params[key] === parentId)
      ?.replace('place_id2', 'place_id')
    const placesCountInPath = path.filter((p) => p === 'places').length
    const isPlaces2 = placesCountInPath === 2
    if (parentIdName && parentId) {
      if (table === 'places') {
        filterParams.parent_id = isPlaces2 ? dataMatch?.params?.place_id : null
      } else if (table === 'occurrences') {
        // need to get the occurrence_import_id from the subproject_id
        filterParams.occurrence_import_id = { in: occurrenceImportIds }
        // there are three types of occurrences
        const lastPathElement = path[path.length - 1]
        if (lastPathElement === 'occurrences-to-assess') {
          filterParams.not_to_assign = null // TODO: catch false
          filterParams.place_id = null
        } else if (lastPathElement === 'occurrences-not-to-assign') {
          filterParams.not_to_assign = true
        } else if (lastPathElement === 'occurrences-assigned') {
          filterParams.place_id =
            isPlaces2 ? dataMatch.params.place_id2 : dataMatch.params.place_id
        }
        // if last path element is
      } else {
        filterParams[parentIdName] = parentId
      }
    }
    // fields exist in root and in projects
    if (table === 'fields' && !parentId) {
      filterParams.project_id = null
    }
    return filterParams
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMatch.params, occurrenceImportIds, path, table, location.pathname])

  // need to use state and effect as table can be undefined
  const [tableResults, setTableResults] = useState([])
  useEffect(() => {
    const get = async () => {
      if (!table) return

      // console.log('DataNavs, effect, setting table results')
      setTableResults(
        await db[table]?.findMany({
          where: filterParams,
          orderBy: { label: 'asc' },
        }),
      )
    }
    get()
  }, [db, filterParams, table, location.pathname])
  // console.log('DataNavs rendering')
  // console.log('DataNavs', {
  //   table,
  //   idField,
  //   pathname,
  //   filterParams,
  //   matches,
  //   filteredMatches,
  //   tableResults,
  // })

  if (!table) return null

  return (
    <nav className="navs">
      {tableResults.map((result) => {
        const value = result[idField]
        const label = result.label ?? value
        // console.log('DataNavs', { value, label })

        return (
          <Nav
            key={value}
            label={label ?? value}
            to={`${pathname}/${value}`}
          />
        )
      })}
    </nav>
  )
})
