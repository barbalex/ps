import { useEffect, useState, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import { buildNavs } from '../../../modules/navs.ts'
import { idFieldFromTable } from '../../../modules/idFieldFromTable.ts'
import { Menu } from './Menu/index.tsx'
import { designingAtom } from '../../../store.ts'

const siblingStyle = { marginRight: 5 }
const labelStyle = {
  userSelect: 'none',
  marginRight: 5,
}

// forwarding refs is crucial for the overflow menu to work
// https://github.com/microsoft/fluentui/issues/27652#issuecomment-1520447241
export const BreadcrumbForFolder = memo(
  ({ match, forOverflowMenu, wrapping = false, ref }) => {
    const [designing] = useAtom(designingAtom)
    const navigate = useNavigate()
    const {
      checkId,
      actionId,
      actionReportId,
      projectId,
      subprojectId,
      placeId,
      placeId2,
      placeReportId,
      goalId,
      chartId,
      goalReportId,
      listId,
      taxonomyId,
    } = match.params

    const { text, table, sibling } = match?.handle?.crumb ?? {}
    const className =
      location.pathname === match.pathname ?
        `breadcrumbs__crumb${forOverflowMenu ? '__menu-item' : ''} is-active`
      : `breadcrumbs__crumb${forOverflowMenu ? '__menu-item' : ''} link`

    const path = match.pathname.split('/').filter((p) => p !== '')
    const placesCount = path.filter((p) => p.includes('places')).length
    const levelWanted = placesCount < 2 ? 1 : 2

    const idField = idFieldFromTable(table)
    const queryTable = table === 'root' || table === 'docs' ? 'projects' : table
    const db = usePGlite()
    const matchParam =
      table === 'places' && levelWanted === 2 ? placeId2 : match.params[idField]

    const res = useLiveQuery(
      `SELECT * FROM ${queryTable} WHERE ${idField} = $1`,
      [matchParam],
    )
    const row = res?.rows?.[0]

    const [navs, setNavs] = useState([])
    useEffect(() => {
      const fetch = async () => {
        const navs = await buildNavs({
          table,
          actionId,
          actionReportId,
          projectId,
          subprojectId,
          placeId,
          placeId2,
          placeReportId,
          goalId,
          chartId,
          goalReportId,
          listId,
          taxonomyId,
          checkId,
          db,
          level: levelWanted,
          designing,
        })

        return setNavs(navs)
      }
      fetch()
    }, [
      checkId,
      actionId,
      actionReportId,
      projectId,
      subprojectId,
      placeId,
      placeId2,
      placeReportId,
      goalId,
      chartId,
      goalReportId,
      listId,
      taxonomyId,
      db,
      table,
      levelWanted,
      designing,
    ])

    // console.log(
    //   'BreadcrumbForFolder, nav-paths:',
    //   navs.map((n) => n.path),
    // )

    let label = row?.label
    if (table === 'root' || table === 'docs') label = text

    // console.log('BreadcrumbForFolder', {
    //   // results,
    //   label,
    //   // idField,
    //   // matchParam,
    //   // row,
    //   table,
    //   // text,
    //   // params: match.params,
    //   // match,
    //   pathname: match.pathname,
    //   navs,
    //   // where,
    //   // place_id2,
    // })

    return (
      <div className="breadcrumbs__crumb_container">
        <div
          className={className}
          onClick={() => navigate({ to: match.pathname })}
          ref={ref}
          style={{
            borderBottom:
              wrapping ? '1px solid rgba(55, 118, 28, 0.5) ' : 'none',
            borderTop: wrapping ? '1px solid rgba(55, 118, 28, 0.5) ' : 'none',
          }}
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
