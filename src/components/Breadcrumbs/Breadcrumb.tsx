import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import './breadcrumb.css'
import { navs } from '../../navs'
import { MenuComponent } from './Menu'
import { useElectric } from '../../ElectricProvider'

export const Breadcrumb = ({ match }) => {
  const navigate = useNavigate()

  const { text, table, folder } = match?.handle?.crumb?.(match) ?? {}
  const className =
    location.pathname === match.pathname
      ? 'breadcrumbs__crumb is-active'
      : 'breadcrumbs__crumb link'

  // TODO:
  // to only query when needed,
  // create two different breadcrumb components
  // one that queries data and one that only uses navs
  const { db } = useElectric()
  const queryTable = table === 'home' ? 'projects' : table
  const { results } = useLiveQuery(db[queryTable]?.liveMany())

  const myNavs = useMemo(() => {
    if (table === 'home' || folder === false) {
      // TODO:
      switch (table) {
        case 'home':
          return navs({ path: '/', match })
          break
        case 'projects':
          return navs({ path: 'project_id', match })
          break
        case 'subprojects':
          return navs({ path: 'subproject_id', match })
          break
        case 'places':
          return navs({ path: 'place_id', match })
          break
        case 'checks':
          return navs({ path: 'check_id', match })
          break
        case 'actions':
          return navs({ path: 'action_id', match })
          break
        case 'action_reports':
          return navs({ path: 'action_report_id', match })
          break
        case 'place_reports':
          return navs({ path: 'place_report_id', match })
          break
        case 'goals':
          return navs({ path: 'goal_id', match })
          break
        case 'goal_reports':
          return navs({ path: 'goal_report_id', match })
          break
        case 'lists':
          return navs({ path: 'list_id', match })
          break
        case 'taxonomies':
          return navs({ path: 'taxonomy_id', match })
          break
        case 'observation_sources':
          return navs({ path: 'observation_source_id', match })
          break
        default:
          return []
          break
      }
    } else {
      // console.log('Breadcrumb, should set myNavs with results', {
      //   table,
      //   results,
      //   match,
      // })
      return results?.map((result) => {
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

        return {
          path,
          text: result[idField],
        }
      })
    }
  }, [folder, match, results, table])

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
