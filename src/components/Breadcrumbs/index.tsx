import { useMatches, useLocation } from 'react-router-dom'

// to only query when needed,
// create two different breadcrumb components
// one that queries data and one that only uses navs
import './breadcrumbs.css'
import { Breadcrumb as DataBreadcrumb } from './BreadcrumbForData'
import { Breadcrumb as FolderBreadcrumb } from './BreadcrumbForFolder'

export const Breadcrumbs = () => {
  const location = useLocation()
  const matches = useMatches()

  const filteredMatches = matches.filter((match) => match.handle?.crumb)

  // need to ensure the breadcrumbs rerender on every location change

  return (
    <nav key={location.pathname} className="breadcrumbs">
      {filteredMatches.map((match) => {
        const { table, folder } = match?.handle?.crumb?.(match) ?? {}

        if (table === 'root' || folder === false) {
          return <FolderBreadcrumb key={match.id} match={match} />
        }

        return <DataBreadcrumb key={match.id} match={match} />
      })}
    </nav>
  )
}
