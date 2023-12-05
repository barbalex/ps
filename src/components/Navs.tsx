import { useMatches, useLocation } from 'react-router-dom'

export const Navs = () => {
  const location = useLocation()
  const matches = useMatches()
  const tos = matches
    .filter((match) => match.pathname === location.pathname)
    .map((match) => match?.handle?.to?.(match?.data))

  // hide this area of there are no tos
  if (!tos.filter((to) => Boolean(to)).length) return null

  return (
    <nav className="navs">
      <ul>{tos}</ul>
    </nav>
  )
}
