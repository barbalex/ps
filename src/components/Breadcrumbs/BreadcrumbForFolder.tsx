import { useMemo } from 'react'
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

  const navs = buildNavs({ table, params: match.params }) ?? []

  const idField = idFieldFromTable(table)
  const queryTable = table === 'root' || table === 'docs' ? 'projects' : table
  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db[queryTable]?.liveMany({
        where: { [idField]: match.params[idField] },
      }),
    [db, queryTable, match],
  )
  const row = results?.[0]

  const label =
    table === 'root' || table === 'docs' ? text : row?.label ?? row?.[idField]

  // console.log('BreadcrumbForFolder', {
  //   results,
  //   label,
  //   idField,
  //   row,
  //   table,
  //   text,
  //   params: match.params,
  //   navs,
  // })

  return (
    <>
      <div className={className} onClick={() => navigate(match.pathname)}>
        <div className="text">{label}</div>
        {navs?.length > 0 && <MenuComponent navs={navs} />}
      </div>
    </>
  )
}
