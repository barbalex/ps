import { useMatches } from 'react-router-dom'

// to only query when needed,
// create two different breadcrumb components
// one that queries data and one that only uses navs
import './breadcrumbs.css'
import { BreadcrumbForData } from './BreadcrumbForData'
import { BreadcrumbForFolder } from './BreadcrumbForFolder'
import { OverflowingBreadcrumbs } from './OverflowingBreadcrumbs'

// TODO: if overflowing, show single line
export const Breadcrumbs = ({ overflowing }) => {
  const matches = useMatches()

  const filteredMatches = matches.filter((match) => match.handle?.crumb)

  console.log('Breadcrumbs, overflowing:', overflowing)
  if (overflowing) return <OverflowingBreadcrumbs matches={filteredMatches} />

  return (
    <nav className="breadcrumbs">
      {filteredMatches.map((match, index) => {
        const { table, folder } = match?.handle?.crumb?.(match) ?? {}

        // console.log('Breadcrumbs', { match, table, folder })

        if (table === 'root' || folder === false) {
          return <BreadcrumbForFolder key={index} match={match} />
        }

        return <BreadcrumbForData key={index} match={match} />
      })}
    </nav>
  )
}
