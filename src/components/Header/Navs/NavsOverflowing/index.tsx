import { useEffect, useState } from 'react'
import { useMatches, useLocation, Link } from 'react-router-dom'

import { DataNavs } from './DataNavs'

export const NavsOverflowing = () => {
  const location = useLocation()
  const matches = useMatches()

  const thisPathsMatches = matches.filter(
    (match) => match.pathname === location.pathname && match.handle,
  )

  const [tos, setTos] = useState([])
  useEffect(() => {
    const fetch = async () => {
      const tos = []
      for (const match of thisPathsMatches) {
        const to = await match?.handle?.to?.(match)
        if (!to) continue
        tos.push(to)
      }

      return setTos(tos.filter((to) => Boolean(to)))
    }
    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // console.log('Navs', {
  //   matches,
  //   tos,
  //   thisPathsMatches,
  //   pathname: location.pathname,
  // })

  // hide this area of there are no tos
  if (!tos?.length) return <DataNavs matches={thisPathsMatches} />

  return (
    <nav className="navs">
      {(tos[0] ?? []).map(({ path, text }) => (
        <Link key={path} to={path}>
          {text}
        </Link>
      ))}
    </nav>
  )
}
