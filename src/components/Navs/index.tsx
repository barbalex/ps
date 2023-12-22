import { useMatches, useLocation, Link } from 'react-router-dom'

import { DataNavs } from './DataNavs'

// new idea
// get all matches for next level down
// But: does not seem possible with react-router
// Hard part would be to navigate through the route object using the location
// Plus: Adding other stuff is probably easier with the current approach
// like: inserting, deleting etc.

export const Navs = () => {
  const location = useLocation()
  const matches = useMatches()

  const thisPathsMatches = matches.filter(
    (match) => match.pathname === location.pathname,
  )

  const tos = thisPathsMatches
    .map((match) => match?.handle?.to?.(match))
    .filter((to) => Boolean(to))

  // console.log('Navs', { matches, tos, thisPathsMatches })

  // hide this area of there are no tos
  if (!tos?.length) return <DataNavs matches={thisPathsMatches} />

  return (
    <nav className="navs">
      {(tos[0] ?? []).map(({ path, text }, index) => (
        <Link key={index} to={path}>
          {text}
        </Link>
      ))}
    </nav>
  )
}
