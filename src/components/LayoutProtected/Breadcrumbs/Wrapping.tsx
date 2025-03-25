// import { useMatches } from 'react-router'
import { useLocation, useMatches } from '@tanstack/react-router'

// to only query when needed,
// create two different breadcrumb components
// one that queries data and one that only uses navs
// import { BreadcrumbForData } from './BreadcrumbForData.tsx'
// import { BreadcrumbForFolder } from './BreadcrumbForFolder.tsx'

// TODO: if overflowing, show single line
export const BreadcrumbsWrapping = () => {
  const location = useLocation()
  const matches = useMatches()

  console.log('Wrapping Breadcrumbs', { matches, pathname: location.pathname })

  return null

  const filteredMatches = matches.filter(
    (match) => match.context?.navDataFetcher,
  )

  // need to ensure the breadcrumbs rerender on every location change

  return (
    <nav
      key={location.pathname}
      className="breadcrumbs"
    >
      {filteredMatches.map((match) => {
        const { table, folder } = match?.handle?.crumb ?? {}

        if (table === 'root' || folder === false) {
          return (
            <BreadcrumbForFolder
              key={match.id}
              match={match}
              wrapping={true}
            />
          )
        }

        return (
          <BreadcrumbForData
            key={match.id}
            match={match}
            wrapping={true}
          />
        )
      })}
    </nav>
  )
}
