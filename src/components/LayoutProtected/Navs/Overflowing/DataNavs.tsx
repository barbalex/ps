import { forwardRef, useState, useEffect, useMemo, memo } from 'react'
import { useLocation } from 'react-router-dom'
import { OverflowItem, Overflow } from '@fluentui/react-components'

import { useElectric } from '../../../../ElectricProvider'
import { idFieldFromTable } from '../../../../modules/idFieldFromTable'
import { Nav } from '../Nav'
import { OverflowMenu } from '.'

const isOdd = (num) => num % 2

// TODO: extract crumbs immediately in all other data nav components
// Datanavas need to query db
// so need to be in a separate component
export const DataNavsOverflowing = memo(
  forwardRef(({ matches }, ref) => {
    const location = useLocation()
    const { db } = useElectric()!

    const dataMatch = useMemo(() => {
      const matchesWithCrumb = matches.map((match) => ({
        ...match,
        crumb: match.handle?.crumb,
      }))
      const dataMatches = matchesWithCrumb.filter(
        (match) =>
          match.crumb?.table !== 'root' && match.crumb?.folder === true,
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
              placesCountInPath === 1
                ? dataMatch.params.place_id
                : dataMatch.params.place_id2
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
      // only using pathname prevents infinite loop
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname])

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
      // only using pathname prevents infinite loop
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname])

    const tos = tableResults.map((result) => {
      const value = result[idField]
      const text = result.label ?? value
      const path = `${pathname}/${value}`

      return { path, text }
    })

    console.log('hello DataNavsOverflowing', {
      table,
      idField,
      pathname,
      tableResults,
      filterParams,
    })

    if (!table) return <div className="navs-resizable" />
    if (!tos.length) return <div className="navs-resizable" />

    return (
      <Overflow overflowDirection="start" padding={20} ref={ref}>
        <nav className="navs-resizable">
          <OverflowMenu tos={tos} />
          {tos.map(({ text, path }) => (
            <OverflowItem key={path} id={path}>
              <Nav label={text} to={path} />
            </OverflowItem>
          ))}
        </nav>
      </Overflow>
    )
  }),
)
