import { useEffect, useState } from 'react'
import { useMatches, useLocation } from 'react-router-dom'

import { DataNavs } from './DataNavs'
import { ToNavs } from './ToNavs'

export const NavsWrapping = ({ designing }) => {
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
        if (!designing && to.showOnlyWhenDesigning) continue
        tos.push(to)
      }

      return setTos(tos.filter((to) => Boolean(to)))
    }
    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, designing])

  const tosToUse = tos[0] ?? []

  // console.log('Navs', {
  //   matches,
  //   tosToUse,
  //   thisPathsMatches,
  //   pathname: location.pathname,
  // })

  return (
    <nav className="navs">
      {tosToUse?.length ? (
        <ToNavs tos={tosToUse} />
      ) : (
        <DataNavs matches={thisPathsMatches} />
      )}
    </nav>
  )
}
