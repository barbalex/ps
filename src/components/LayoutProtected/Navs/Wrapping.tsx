import { useEffect, useState } from 'react'
import { useMatches, useLocation, useParams } from 'react-router-dom'

import { DataNavs } from './DataNavs'
import { ToNavs } from './ToNavs'
import { buildNavs } from '../../../modules/navs'
import { useElectric } from '../../../ElectricProvider.tsx'
import { useCorbadoSession } from '@corbado/react'

export const NavsWrapping = ({ designing }) => {
  const location = useLocation()
  const matches = useMatches()
  const params = useParams()
  const { db } = useElectric()!
  const { user: authUser } = useCorbadoSession()

  const thisPathsMatches = matches.filter(
    (match) => match.pathname === location.pathname && match.handle,
  )

  const [tos, setTos] = useState([])
  useEffect(() => {
    const fetch = async () => {
      const tos = []
      for (const match of thisPathsMatches) {
        const to = match?.handle?.to
        if (!to) continue
        if (!designing && to.showOnlyWhenDesigning) continue
        // build tos
        const nav = await buildNavs({ ...to, ...params, db, authUser })
        tos.push(nav)
      }

      return setTos(tos.filter((to) => Boolean(to)))
    }
    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, designing])

  const tosToUse = tos[0] ?? []

  // console.log('hello Navs', {
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
