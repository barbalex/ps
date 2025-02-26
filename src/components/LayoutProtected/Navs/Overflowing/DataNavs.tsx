import { useState, useEffect, useMemo, memo } from 'react'
import { useLocation } from 'react-router-dom'
import { OverflowItem, Overflow } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'

import { idFieldFromTable } from '../../../../modules/idFieldFromTable.ts'
import { Nav } from '../Nav.tsx'
import { OverflowMenu } from './index.tsx'

// TODO: extract crumbs immediately in all other data nav components
// DataNavs need to query db
// so need to be in a separate component
export const DataNavsOverflowing = memo(({ matches, ref }) => {
  const location = useLocation()
  const db = usePGlite()

  const dataMatch = useMemo(() => {
    const matchesWithCrumb = matches.map((match) => ({
      ...match,
      crumb: match.handle?.crumb,
    }))
    const dataMatches = matchesWithCrumb.filter(
      (match) => match.crumb?.table !== 'root' && match.crumb?.folder === true,
    )
    const dataMatch = dataMatches?.[0] ?? {}
    // handle can't be cloned
    delete dataMatch.handle

    return structuredClone(dataMatch)
  }, [matches])

  const table = dataMatch?.crumb?.table
  const pathname = dataMatch?.pathname ?? ''
  const path = pathname.split('/').filter((path) => path !== '')
  const idField = idFieldFromTable(table)
  // console.log('hello DataNavsOverflowing', {
  //   dataMatch,
  //   table,
  //   pathname,
  //   path,
  //   idField,
  // })

  const [occurrenceImportIds, setOccurrenceImportIds] = useState([])
  useEffect(() => {
    const get = async () => {
      switch (table) {
        case 'occurrences': {
          if (!dataMatch?.params?.subproject_id) return
          const res = await db.query(
            `SELECT occurrence_import_id FROM occurrence_imports WHERE subproject_id = $1`,
            [dataMatch.params.subproject_id],
          )
          const occurrenceImports = res?.rows ?? []
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
  }, [dataMatch?.params?.subproject_id, db, table])

  const filterParams = useMemo(() => {
    const filterParams = {}
    // Add only the last to the filter
    // Wanted to get it from params. But not useable because also contains lower level ids!!!
    // so need to get it from path which does NOT contain lower levels
    // if length is dividable by two, then it is a parent id
    const indexOfParentId = path.length - 2
    const parentId = indexOfParentId ? path[indexOfParentId] : undefined
    // need to get the name from the parents as in path is altered
    // for instance: place_report_values > values
    const parentIdName = Object.keys(dataMatch.params ?? {})
      .find((key) => dataMatch.params[key] === parentId)
      ?.replace('place_id2', 'place_id')
    const placesCountInPath = path.filter((p) => p === 'places').length
    const isPlaces2 = placesCountInPath === 2
    // console.log('DataNavsOverflowing 1', {
    //   path,
    //   indexOfParentId,
    //   parentId,
    //   parentIdName,
    //   isPlaces2,
    //   placesCountInPath,
    //   dataMatchParams: dataMatch.params,
    // })
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
          filterParams.place_id = isPlaces2
            ? dataMatch.params.place_id2
            : dataMatch.params.place_id
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
  }, [dataMatch?.params, occurrenceImportIds, path, table])

  // WARNING: if table is undefined, bad things will happen
  // Thus using effect and state instead of live query
  const [tableResults, setTableResults] = useState([])
  useEffect(() => {
    if (!table) return
    const get = async () => {
      const results = await db[table]?.findMany({
        where: filterParams,
        orderBy: { label: 'asc' },
      })
      setTableResults(results)
    }
    get()
    // including path or filterParams causes infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, dataMatch?.params, occurrenceImportIds, table, location.pathname])

  const tos = tableResults.map((result) => {
    const value = result[idField]
    const text = result.label ?? value
    const path = `${pathname}/${value}`

    return { path, text }
  })

  // console.log('DataNavsOverflowing 2', {
  //   table,
  //   idField,
  //   pathname,
  //   tableResults,
  //   filterParams,
  //   tos,
  // })

  if (!table) return <div className="navs-resizable" />
  if (!tos.length) return <div className="navs-resizable" />

  return (
    <Overflow
      overflowDirection="end"
      padding={20}
      ref={ref}
    >
      <nav className="navs-resizable">
        {tos.map(({ text, path }) => (
          <OverflowItem
            key={path}
            id={path}
          >
            <Nav
              label={text}
              to={path}
            />
          </OverflowItem>
        ))}
        <OverflowMenu tos={tos} />
      </nav>
    </Overflow>
  )
})
