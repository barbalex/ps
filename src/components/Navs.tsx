import { useMatches, useLocation } from 'react-router-dom'

// new idea
// get all matches for next level down
// But: does not seem possible with react-router
// Hard part would be to navigate through the route object using the location
// Plus: Adding other stuff is probably easier with the current approach
// like: inserting, deleting etc.

export const Navs = () => {
  const location = useLocation()
  const matches = useMatches()

  // console.log('Navs, matches', matches)

  const tos = matches
    .filter((match) => match.pathname === location.pathname)
    .map((match) => match?.handle?.to?.(match))
    .filter((to) => Boolean(to))

  // hide this area of there are no tos
  if (!tos?.length) return null

  return <nav className="navs">{tos[0]}</nav>
}
