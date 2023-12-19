import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import './breadcrumb.css'
import { MenuComponent } from './Menu'
import { useElectric } from '../../ElectricProvider'
import { labelFromData } from '../../modules/labelFromData'
import { idFieldFromTable } from '../../modules/idFieldFromTable'

export const Breadcrumb = ({ match }) => {
  const navigate = useNavigate()

  const { text, table } = match?.handle?.crumb?.(match) ?? {}
  const className =
    location.pathname === match.pathname
      ? 'breadcrumbs__crumb is-active'
      : 'breadcrumbs__crumb link'

  // TODO:
  // to only query when needed,
  // create two different breadcrumb components
  // one that queries data and one that only uses navs
  const { db } = useElectric()
  const queryTable = table === 'home' || table === 'docs' ? 'projects' : table
  console.log('Breadcrumb', { queryTable, table })
  const { results } = useLiveQuery(
    () => db[queryTable]?.liveMany(),
    [db, queryTable],
  )

  const idField = idFieldFromTable(table)

  const myNavs = useMemo(
    () =>
      (results ?? []).map((result) => {
        const path = `${match.pathname}/${result[idField]}`
        // console.log('Breadcrumb, path', { path, idField, result, table })

        return {
          path,
          text: labelFromData({ data: result, table }) ?? result[idField],
        }
      }),
    [idField, match.pathname, results, table],
  )

  // console.log('Breadcrumb', { myNavs, match, table, text })

  return (
    <>
      <div className={className} onClick={() => navigate(match.pathname)}>
        <div className="text">{text}</div>
        {myNavs?.length > 0 && <MenuComponent navs={myNavs} />}
      </div>
    </>
  )
}
