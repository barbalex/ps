import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useElectric } from '../../ElectricProvider'
import { useLiveQuery } from 'electric-sql/react'

import './breadcrumb.css'
import { navs } from '../../modules/navs'
import { MenuComponent } from './Menu'
import { idFieldFromTable } from '../../modules/idFieldFromTable'

export const Breadcrumb = ({ match }) => {
  const navigate = useNavigate()

  const { text, table } = match?.handle?.crumb?.(match) ?? {}
  const className =
    location.pathname === match.pathname
      ? 'breadcrumbs__crumb is-active'
      : 'breadcrumbs__crumb link'

  const myNavs = navs({ table, match }) ?? []
  // const myNavs = useMemo(() => {
  //   switch (table) {
  //     case 'root':
  //       return navs({ table: 'root', match })
  //       break
  //     case 'projects':
  //       return navs({ table: 'projects', match })
  //       break
  //     case 'subprojects':
  //       return navs({ table: 'subprojects', match })
  //       break
  //     case 'places':
  //       return navs({ table: 'places', match })
  //       break
  //     case 'checks':
  //       return navs({ table: 'checks', match })
  //       break
  //     case 'actions':
  //       return navs({ table: 'actions', match })
  //       break
  //     case 'action_reports':
  //       return navs({ table: 'action_reports', match })
  //       break
  //     case 'place_reports':
  //       return navs({ table: 'place_reports', match })
  //       break
  //     case 'goals':
  //       return navs({ table: 'goals', match })
  //       break
  //     case 'goal_reports':
  //       return navs({ table: 'goal_reports', match })
  //       break
  //     case 'lists':
  //       return navs({ table: 'lists', match })
  //       break
  //     case 'taxonomies':
  //       return navs({ table: 'taxonomies', match })
  //       break
  //     case 'observation_sources':
  //       return navs({ table: 'observation_sources', match })
  //       break
  //     case 'docs':
  //       return []
  //       break
  //     default:
  //       return []
  //       break
  //   }
  // }, [match, table])

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

  const label = useMemo(
    () =>
      table === 'root' || table === 'docs'
        ? text
        : row?.label ?? row?.[idField],
    [idField, row, table, text],
  )

  // console.log('BreadcrumbForFolder', {
  //   results,
  //   label,
  //   idField,
  //   row,
  //   table,
  //   text,
  //   params: match.params,
  // })

  return (
    <>
      <div className={className} onClick={() => navigate(match.pathname)}>
        <div className="text">{label}</div>
        {myNavs?.length > 0 && <MenuComponent navs={myNavs} />}
      </div>
    </>
  )
}
