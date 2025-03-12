import { useEffect, useState, useMemo } from 'react'
import { useMatches, useLocation, useParams } from 'react-router'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { DataNavs } from './DataNavs.tsx'
import { ToNavs } from './ToNavs.tsx'
import { buildNavs } from '../../../modules/navs.ts'
import { designingAtom } from '../../../store.ts'

// TODO: this component runs way too often
export const NavsWrapping = () => {
  const [designing] = useAtom(designingAtom)
  const location = useLocation()
  const matches = useMatches()
  const params = useParams()
  const db = usePGlite()

  // console.log('Wrapping Navs', { matches, pathname: location.pathname })

  const thisPathsMatches = useMemo(
    () =>
      matches.filter(
        (match) => match.pathname === location.pathname && match.handle,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname],
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
        const nav = await buildNavs({
          ...to,
          ...params,
          db,
          designing,
        })
        tos.push(nav)
      }

      return setTos(tos.filter((to) => Boolean(to)))
    }
    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, designing])

  const tosToUse = tos[0] ?? []

  // console.log('Wrapping Navs', {
  //   matches,
  //   tosToUse,
  //   thisPathsMatches,
  //   pathname: location.pathname,
  //   tosPaths: tos.map((to) => to.path),
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
