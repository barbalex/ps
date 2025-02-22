import { useEffect, useState, useMemo, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { usePGlite } from '@electric-sql/pglite-react'

import { idFieldFromTable } from '../../../modules/idFieldFromTable.ts'
import { Menu } from './Menu/index.tsx'

const siblingStyle = {
  marginLeft: 5,
}
const labelStyle = {
  userSelect: 'none',
  marginRight: 5,
}

// forwarding refs is crucial for the overflow menu to work
// https://github.com/microsoft/fluentui/issues/27652#issuecomment-1520447241
export const BreadcrumbForData = memo(
  ({ match, forOverflowMenu, wrapping = false, ref }) => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const { text, table, sibling } = match?.handle?.crumb ?? {}
    const className =
      location.pathname === match.pathname
        ? `breadcrumbs__crumb${forOverflowMenu ? '__menu-item' : ''} is-active`
        : `breadcrumbs__crumb${forOverflowMenu ? '__menu-item' : ''} link`

    const path = match.pathname.split('/').filter((p) => p !== '')
    const placesCount = path.filter((p) => p.includes('places')).length
    const levelWanted = placesCount < 2 ? 1 : 2

    const [occurrenceImportIds, setOccurrenceImportIds] = useState([])

    const where = useMemo(() => {
      // filter by parents
      let where = ''

      // Add only the last to the filter
      // Wanted to get it from params. But not useable because also contains lower level ids!!!
      // so need to get it from path which does NOT contain lower levels
      // if length is devisable by two, then it is a parent id
      const indexOfParentId = path.length - 2
      const parentId = indexOfParentId ? path[indexOfParentId] : undefined
      // need to get the name from the parents as in path is altered
      // for instance: place_report_values > values
      const parentIdName = Object.keys(match.params)
        .find((key) => match.params[key] === parentId)
        ?.replace('place_id2', 'place_id')
      const placesCountInPath = path.filter((p) => p.includes('places')).length
      if (parentIdName && parentId) {
        if (table === 'places' && placesCountInPath === 2) {
          where += `parent_id = '${match.params.place_id}'`
        } else if (table === 'places') {
          where += `${parentIdName} = '${parentId}' AND parent_id IS NULL`
        } else if (table === 'occurrences') {
          // need to get the occurrence_import_id from the subproject_id
          // TODO:
          where += `occurrence_import_id = ANY ({${occurrenceImportIds
            .map((o) => `'${o}'`)
            .join(',')}})`
          // there are three types of occurrences
          const lastPathElement = path[path.length - 1]
          if (lastPathElement === 'occurrences-to-assess') {
            where += ` AND not_to_assign IS NULL AND place_id IS NULL`
          } else if (lastPathElement === 'occurrences-not-to-assign') {
            where += ` AND not_to_assign IS TRUE`
          } else if (lastPathElement === 'occurrences-assigned') {
            where += ` AND place_id = '${
              placesCountInPath === 1
                ? match.params.place_id
                : match.params.place_id2
            }'`
          }
          // if last path element is
        } else {
          where += `${parentIdName} = '${parentId}'`
        }
      }
      // fields exist in root and in projects
      if (table === 'fields' && !parentId) {
        where += `${where ? ' AND ' : ''}project_id IS NULL`
      }
      return where
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [match.params, occurrenceImportIds, path, table, location.pathname])
    // TODO: test including
    // if (table === 'projects') {
    //   queryParam.include = { subprojects: true }
    // }
    // if (table === 'subprojects') {
    //   queryParam.include = { projects: true }
    // }
    // TODO: include referenced tables needed for the label
    // TODO: this results in zod error: invalid type. expected string, received null
    // https://github.com/electric-sql/electric/issues/782
    // if (table.endsWith('_values')) {
    //   queryParam.include = { units: true }
    // }

    const db = usePGlite()
    const queryTable = table === 'root' || table === 'docs' ? 'projects' : table

    // console.log('BreadcrumbForData', {
    //   queryTable,
    //   table,
    //   filterParams,
    //   queryParam,
    //   db,
    // })

    const res = useLiveQuery(
      `SELECT * FROM ${queryTable} ${
        where ? ` WHERE ${where}` : ''
      } order by label asc`,
    )
    const results = res?.rows ?? []

    const idField = idFieldFromTable(table)
    const navs = results.map((result) => ({
      path: `${match.pathname}/${result[idField]}`,
      text: result.label ?? result[idField],
    }))

    // console.log(
    //   'BreadcrumbForData, nav-paths:',
    //   navs.map((n) => n.path),
    // )
    // console.log('BreadcrumbForData, idField:', idField)

    const [label, setLabel] = useState(text)
    useEffect(() => {
      const get = async () => {
        switch (table) {
          case 'places': {
            const res = await db.query(
              `SELECT * FROM place_levels WHERE project_id = $1 AND level = $2`,
              [match.params.project_id, levelWanted],
            )
            const placeLevels = res?.rows ?? []
            const levelRow = placeLevels[0]
            const label =
              levelRow?.name_plural ?? levelRow?.name_short ?? 'Places'
            setLabel(label)
            break
          }
          case 'subprojects': {
            const res = await db.query(
              `SELECT * FROM projects WHERE project_id = $1`,
              [match.params.project_id],
            )
            const project = res?.rows?.[0]
            const label = project?.subproject_name_plural ?? 'Subprojects'
            setLabel(label)
            break
          }
          case 'occurrences': {
            if (!match?.params?.subproject_id) return
            const res = await db.query(
              `SELECT * FROM occurrence_imports WHERE subproject_id = $1`,
              [match.params.subproject_id],
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
    }, [db, levelWanted, match, match.params, match.params.project_id, table])

    // console.log('BreadcrumbForData', {
    //   table,
    //   params: match.params,
    //   text,
    //   label,
    //   results,
    //   pathname: match.pathname,
    //   filterParams,
    //   idField,
    //   path,
    // })

    return (
      <div className="breadcrumbs__crumb_container">
        <div
          className={className}
          style={{
            borderBottom: wrapping
              ? '1px solid rgba(55, 118, 28, 0.5) '
              : 'none',
            borderTop: wrapping ? '1px solid rgba(55, 118, 28, 0.5) ' : 'none',
          }}
          onClick={() =>
            navigate({
              pathname: match.pathname,
              search: searchParams.toString(),
            })
          }
          ref={ref}
        >
          <div style={labelStyle}>{label}</div>
          {!!sibling && !forOverflowMenu && (
            <div style={siblingStyle}>{sibling}</div>
          )}
          {!forOverflowMenu && <Menu navs={navs} />}
        </div>
      </div>
    )
  },
)
