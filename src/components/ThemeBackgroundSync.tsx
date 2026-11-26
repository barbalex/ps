import { useContext, useEffect, useRef } from 'react'
import { useAtom, useSetAtom } from 'jotai'

import { ThemeBackground } from '../modules/themeBackground.ts'
import { useUrlLayers } from '../modules/useUrlLayers.ts'
import { lastThemeBackgroundAtom, mapLayerSortingAtom } from '../store.ts'

export const ThemeBackgroundSync = () => {
  const background = useContext(ThemeBackground)
  const [lastSaved, setLastSaved] = useAtom(lastThemeBackgroundAtom)
  const setSorting = useSetAtom(mapLayerSortingAtom)
  const { urlLayers, setLayers } = useUrlLayers()
  const previous = useRef(background)

  useEffect(() => {
    // A saved stack can span an OS theme change while the app was closed.
    if (lastSaved !== background) {
      if (lastSaved)
        setSorting((ids) =>
          ids.includes(lastSaved) ?
            ids.map((id) => (id === lastSaved ? background : id))
          : ids,
        )
      setLastSaved(background)
    }

    // A newly opened shared link keeps its exact stack. Only rewrite it
    // when the resolved theme actually changes while viewing it.
    const old = previous.current
    previous.current = background
    if (old !== background && urlLayers?.includes(old)) {
      setLayers(urlLayers.map((id) => (id === old ? background : id)))
    }
  }, [background, lastSaved, setLastSaved, setSorting, urlLayers, setLayers])

  return null
}
