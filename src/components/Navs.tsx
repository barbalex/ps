import { useMatches, useLocation } from 'react-router-dom'

export const Navs = () => {
  const location = useLocation()
  const matches = useMatches()
  console.log('matches', matches)
  const tos = matches
    .filter((match) => match.pathname === location.pathname)
    .map((match) => match?.handle?.to?.(match))
    .filter((to) => Boolean(to))

  // hide this area of there are no tos
  if (!tos?.length) return null

  return <nav className="navs">{tos[0]}</nav>
}
