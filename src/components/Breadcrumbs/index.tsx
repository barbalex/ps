import { useState, useCallback } from 'react'
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

  const [rerenderInteger, setRerenderInteger] = useState(0)
  const rerender = useCallback(() => setRerenderInteger((i) => i + 1), [])

  const filteredMatches = matches.filter((match) => match.handle?.crumb)

  console.log('Breadcrumbs', { matches, filteredMatches, rerenderInteger })

  return (
    <nav
      key={`${rerenderInteger}/${location.pathname}`}
      className="breadcrumbs"
    >
      {filteredMatches.map((match, index) => {
        const { table, folder } = match?.handle?.crumb?.(match) ?? {}

        // console.log('Breadcrumbs', { match, table, folder })

        if (table === 'root' || folder === false) {
          return (
            <FolderBreadcrumb key={index} match={match} rerender={rerender} />
          )
        }

        return <DataBreadcrumb key={index} match={match} rerender={rerender} />
      })}
    </nav>
  )
}
