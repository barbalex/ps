import { Outlet, useSearch } from '@tanstack/react-router'
import { Allotment } from 'allotment'
import { useAtomValue } from 'jotai'
import 'allotment/dist/style.css'

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

const from = '/data'

export const Main = () => {
  const mapMaximized = useAtomValue(mapMaximizedAtom)
  const tabs = useAtomValue(tabsAtom)

  // onlyForm is a query parameter that allows the user to view a form without the rest of the app
  // used for popups inside the map
  const { onlyForm } = useSearch({ from })

  const mapMaximizedAndVisible = (mapMaximized && tabs.includes('map')) ?? false

  // console.log('LayoutProtected.Main', { tabs })

  if (onlyForm) return <Outlet />

  return (
    <div style={containerStyle}>
      <Allotment>
        {!mapMaximizedAndVisible && tabs.includes('tree') && <Tree />}
        {!mapMaximizedAndVisible && tabs.includes('data') && <Outlet />}
        {tabs.includes('map') && <MapContainer />}
      </Allotment>
    </div>
  )
}
