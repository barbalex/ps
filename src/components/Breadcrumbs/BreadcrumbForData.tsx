import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import './breadcrumb.css'
import { MenuComponent } from './Menu'
import { useElectric } from '../../ElectricProvider'

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
  const { results } = useLiveQuery(
    () => db[queryTable]?.liveMany(),
    [db, queryTable],
  )

  const myNavs = useMemo(
    () =>
      (results ?? []).map((result) => {
        const idField = table.endsWith('taxa')
          ? `${table.slice(0, -1)}on_id`
          : table === 'taxonomies'
          ? 'taxonomy'
          : table === 'field_types'
          ? 'field_type'
          : table === 'widget_types'
          ? 'widget_type'
          : table === 'widgets_for_fields'
          ? 'widget_for_field_id'
          : `${table.slice(0, -1)}_id` // TODO: build label
        const path = `${match.pathname}/${result[idField]}`
        // console.log('Breadcrumb, path', { path, idField, result, table })

        return {
          path,
          text: result[idField],
        }
      }),
    [match.pathname, results, table],
  )

  // console.log('Breadcrumb, myNavs', myNavs)

  return (
    <>
      <div className={className} onClick={() => navigate(match.pathname)}>
        <div className="text">{text}</div>
        {myNavs?.length > 0 && <MenuComponent navs={myNavs} />}
      </div>
    </>
  )
}
