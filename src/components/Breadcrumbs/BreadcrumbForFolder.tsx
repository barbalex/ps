import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import './breadcrumb.css'
import { navs } from '../../navs'
import { MenuComponent } from './Menu'

export const Breadcrumb = ({ match }) => {
  const navigate = useNavigate()

  const { text, table } = match?.handle?.crumb?.(match) ?? {}
  const className =
    location.pathname === match.pathname
      ? 'breadcrumbs__crumb is-active'
      : 'breadcrumbs__crumb link'

  const myNavs = useMemo(() => {
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
      case 'docs':
        return []
        break
      default:
        return []
        break
    }
  }, [match, table])

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
