import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useElectric } from '../../ElectricProvider'
import { useLiveQuery } from 'electric-sql/react'

import './breadcrumb.css'
import { buildNavs } from '../../modules/navs'
import { MenuComponent } from './Menu'
import { idFieldFromTable } from '../../modules/idFieldFromTable'

export const Breadcrumb = ({ match }) => {
  const navigate = useNavigate()

  const { text, table } = match?.handle?.crumb?.(match) ?? {}
  const className =
    location.pathname === match.pathname
      ? 'breadcrumbs__crumb is-active'
      : 'breadcrumbs__crumb link'

  const idField = idFieldFromTable(table)
  const queryTable = table === 'root' || table === 'docs' ? 'projects' : table
  const { db } = useElectric()
  // TODO:
  // if table === 'places'
  // include subproject > project > place_levels
  // to:
  // 1. know how to label place?
  // 2. know if second level exists
  // then pass to buildNavs
  const matchParam =
    table === 'places' && match.params.place_id2
      ? match.params.place_id2
      : match.params[idField]
  const { results } = useLiveQuery(
    () =>
      db[queryTable]?.liveMany({
        where: { [idField]: matchParam },
      }),
    [db, queryTable, match],
  )
  const row = results?.[0]

  const [navs, setNavs] = useState([])
  useEffect(() => {
    const fetch = async () => {
      const navs = await buildNavs({ table, params: match.params, db })
      return setNavs(navs)
    }
    fetch()
  }, [match, db, table])

  let label = row?.label ?? row?.[idField]
  if (table === 'root' || table === 'docs') label = text

  console.log('BreadcrumbForFolder', {
    results,
    label,
    idField,
    row,
    table,
    text,
    params: match.params,
    match,
    navs,
  })

  return (
    <>
      <div className={className} onClick={() => navigate(match.pathname)}>
        <div className="text">{label}</div>
        {navs?.length > 0 && <MenuComponent navs={navs} />}
      </div>
    </>
  )
}
