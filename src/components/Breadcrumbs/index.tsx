import { useMatches } from 'react-router-dom'

// to only query when needed,
// create two different breadcrumb components
// one that queries data and one that only uses navs
import './breadcrumbs.css'
import { Breadcrumb as DataBreadcrumb } from './BreadcrumbForData'
import { Breadcrumb as FolderBreadcrumb } from './BreadcrumbForFolder'

export const Breadcrumbs = () => {
  const matches = useMatches()

  const filteredMatches = matches.filter((match) => match.handle?.crumb)

  return (
    <nav className="breadcrumbs">
      {filteredMatches.map((match, index) => {
        const { table, folder } = match?.handle?.crumb?.(match) ?? {}

        if (table === 'root' || folder === false) {
          return <FolderBreadcrumb key={index} match={match} />
        }

        return <DataBreadcrumb key={index} match={match} />
      })}
    </nav>
  )
}
