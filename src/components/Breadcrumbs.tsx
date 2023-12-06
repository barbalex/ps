import { useMatches, useLocation } from 'react-router-dom'

export const Breadcrumbs = () => {
  const location = useLocation()
  const matches = useMatches()

  const crumbs = matches
    .filter((match) => match.pathname === location.pathname)
    // first get rid of any matches that don't have handle and crumb
    .filter((match) => Boolean(match.handle?.crumb))
    // now map them into an array of elements
    .map((match) => match.handle.crumb(match))

  return <nav className="breadcrumbs">{crumbs[0]}</nav>
}
