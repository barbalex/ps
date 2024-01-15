import { useEffect, useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useElectric } from '../../ElectricProvider'
import { useLiveQuery } from 'electric-sql/react'

import './breadcrumb.css'
import { buildNavs } from '../../modules/navs'
import { idFieldFromTable } from '../../modules/idFieldFromTable'
import { Menu } from '../BreadcrumbsMenu'

export const BreadcrumbForFolder = memo(({ match }) => {
  const navigate = useNavigate()
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
    goal_report_id,
    list_id,
    taxonomy_id,
    observation_source_id,
  } = match.params

  const { text, table } = match?.handle?.crumb?.(match) ?? {}
  const className =
    location.pathname === match.pathname
      ? 'breadcrumbs__crumb is-active'
      : 'breadcrumbs__crumb link'

  const path = match.pathname.split('/').filter((p) => p !== '')
  const placesCount = path.filter((p) => p.includes('places')).length
  const levelWanted = placesCount < 2 ? 1 : 2

  const idField = idFieldFromTable(table)
  const queryTable = table === 'root' || table === 'docs' ? 'projects' : table
  const { db } = useElectric()
  const matchParam =
    table === 'places' && levelWanted === 2 ? place_id2 : match.params[idField]
  const where = { [idField]: matchParam }
  const { results } = useLiveQuery(
    () =>
      db[queryTable]?.liveMany({
        where,
      }),
    [db, queryTable, matchParam, idField],
  )
  const row = results?.[0]

  const [navs, setNavs] = useState([])
  useEffect(() => {
    const fetch = async () => {
      // console.log('BreadcrumbForFolder calling navs')
      const navs = await buildNavs({
        table,
        check_id,
        action_id,
        action_report_id,
        project_id,
        subproject_id,
        place_id,
        place_id2,
        place_report_id,
        goal_id,
        goal_report_id,
        list_id,
        taxonomy_id,
        observation_source_id,
        db,
        level: levelWanted,
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
    goal_report_id,
    list_id,
    taxonomy_id,
    observation_source_id,
    db,
    table,
    levelWanted,
  ])

  let label = row?.label ?? row?.[idField]
  if (table === 'root' || table === 'docs') label = text

  // console.log('BreadcrumbForFolder', {
  //   // results,
  //   // label,
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
    <div className={className} onClick={() => navigate(match.pathname)}>
      <div className="text">{label}</div>
      <Menu navs={navs} />
    </div>
  )
})
