import { memo } from 'react'
import { Outlet } from 'react-router'
// import { useSearchParams } from 'react-router'
import { Allotment } from 'allotment'
import { useAtom } from 'jotai'

import { Tree } from '../Tree/index.tsx'
import { MapContainer } from '../Map/index.tsx'
import { mapMaximizedAtom, tabsAtom } from '../../store.ts'

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflow: 'hidden',
  position: 'relative',
}

export const Main = memo(() => {
  const [mapMaximized] = useAtom(mapMaximizedAtom)
  const [tabs] = useAtom(tabsAtom)

  // onlyForm is a query parameter that allows the user to view a form without the rest of the app
  // used for popups inside the map
  // TODO: this renders on every navigation!!! Thus temporarily disabled
  // because of the searchParams? JES
  // seems not solvable with react-router: https://github.com/remix-run/react-router/discussions/9851
  // there is this pull request: https://github.com/remix-run/react-router/pull/10740
  // const [searchParams] = useSearchParams()
  // const onlyForm = searchParams.get('onlyForm')
  const onlyForm = false

  const mapMaximizedAndVisible = (mapMaximized && tabs.includes('map')) ?? false

  if (onlyForm) return <Outlet />

  // TODO:re-enable all
  return (
    <div style={containerStyle}>
      <Allotment>
        {!mapMaximizedAndVisible && tabs.includes('tree') && <Tree />}
        {!mapMaximizedAndVisible && tabs.includes('data') && <Outlet />}
        {tabs.includes('map') && <MapContainer />}
      </Allotment>
    </div>
  )
})
