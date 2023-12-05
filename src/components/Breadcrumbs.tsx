import { useMatches, useLocation } from 'react-router-dom'

export const Breadcrumbs = () => {
  const location = useLocation()
  const matches = useMatches()
  // console.log('Breadcrumbs, matches:', matches)
  const crumbs = matches
    .filter((match) => match.pathname === location.pathname)
    // first get rid of any matches that don't have handle and crumb
    .filter((match) => Boolean(match.handle?.crumb))
    // now map them into an array of elements, passing the loader
    // data to each one
    .map((match) => match.handle.crumb(match.data))

  return <nav className="breadcrumbs">{crumbs[0]}</nav>
}
