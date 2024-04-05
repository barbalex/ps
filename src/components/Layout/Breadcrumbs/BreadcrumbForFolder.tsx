import { useEffect, useState, forwardRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useElectric } from '../../../ElectricProvider'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbadoSession } from '@corbado/react'

import './breadcrumb.css'
import { buildNavs } from '../../../modules/navs'
import { idFieldFromTable } from '../../../modules/idFieldFromTable'
import { Menu } from './Menu'

const siblingStyle = {
  marginLeft: 7,
}
const labelStyle = { userSelect: 'none' }

// forwarding refs is crucial for the overflow menu to work
// https://github.com/microsoft/fluentui/issues/27652#issuecomment-1520447241
export const BreadcrumbForFolder = forwardRef(
  ({ match, forOverflowMenu }, ref) => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const {
      check_id,
      action_id,
      action_report_id,
      project_id,
      subproject_id,
      place_id,
      place_id2,
      place_report_id,
      goal_id,
      chart_id,
      goal_report_id,
      list_id,
      taxonomy_id,
      observation_source_id,
    } = match.params

    const { user: authUser } = useCorbadoSession()

    const { text, table, sibling } = match?.handle?.crumb?.(match) ?? {}
    const className =
      location.pathname === match.pathname
        ? `breadcrumbs__crumb${forOverflowMenu ? '__menu-item' : ''} is-active`
        : `breadcrumbs__crumb${forOverflowMenu ? '__menu-item' : ''} link`

    const path = match.pathname.split('/').filter((p) => p !== '')
    const placesCount = path.filter((p) => p.includes('places')).length
    const levelWanted = placesCount < 2 ? 1 : 2

    const idField = idFieldFromTable(table)
    const queryTable = table === 'root' || table === 'docs' ? 'projects' : table
    const { db } = useElectric()!
    const matchParam =
      table === 'places' && levelWanted === 2
        ? place_id2
        : match.params[idField]
    const where = { [idField]: matchParam }
    const { results } = useLiveQuery(db[queryTable]?.liveMany({ where }))
    const row = results?.[0]
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({
        where: { authenticated_email: authUser.email },
      }),
    )
    const designing = appState?.designing ?? false

    const [navs, setNavs] = useState([])
    useEffect(() => {
      const fetch = async () => {
        const navs = await buildNavs({
          table,
          action_id,
          action_report_id,
          project_id,
          subproject_id,
          place_id,
          place_id2,
          place_report_id,
          goal_id,
          chart_id,
          goal_report_id,
          list_id,
          taxonomy_id,
          observation_source_id,
          check_id,
          db,
          level: levelWanted,
          authUser,
        })

        return setNavs(navs)
      }
      fetch()
    }, [
      check_id,
      action_id,
      action_report_id,
      project_id,
      subproject_id,
      place_id,
      place_id2,
      place_report_id,
      goal_id,
      chart_id,
      goal_report_id,
      list_id,
      taxonomy_id,
      observation_source_id,
      db,
      table,
      levelWanted,
      designing,
      authUser,
    ])

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
      <div
        className={className}
        onClick={() =>
          navigate({
            pathname: match.pathname,
            search: searchParams.toString(),
          })
        }
        ref={ref}
      >
        <div style={labelStyle}>{label}</div>
        {!!sibling && <div style={siblingStyle}>{sibling}</div>}
        <Menu navs={navs} />
      </div>
    )
  },
)
