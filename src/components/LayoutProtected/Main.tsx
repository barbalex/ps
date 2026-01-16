import { Outlet, useSearch } from '@tanstack/react-router'
import { Allotment } from 'allotment'
import { useAtomValue } from 'jotai'
import 'allotment/dist/style.css'

import { Tree } from '../Tree/index.tsx'
import { MapContainer } from '../Map/index.tsx'
import { mapMaximizedAtom, tabsAtom } from '../../store.ts'
import styles from './Main.module.css'

const from = '/data'

export const Main = () => {
  const mapMaximized = useAtomValue(mapMaximizedAtom)
  const tabs = useAtomValue(tabsAtom)

  // onlyForm is a query parameter that allows the user to view a form without the rest of the app
  // used for popups inside the map
  const { onlyForm } = useSearch({ from })

  const mapMaximizedAndVisible = (mapMaximized && tabs.includes('map')) ?? false

  if (onlyForm) return <Outlet />

  // the classNames are used to style the allotment panes
  // especially to hide others when only the Outlet is printed
  return (
    <div className={styles.container}>
      <Allotment>
        {!mapMaximizedAndVisible && tabs.includes('tree') && (
          <div className="allotment-tree">
            <Tree />
          </div>
        )}
        {!mapMaximizedAndVisible && tabs.includes('data') && (
          <div className="allotment-data">
            <Outlet />
          </div>
        )}
        {tabs.includes('map') && (
          <div className="allotment-map">
            <MapContainer />
          </div>
        )}
      </Allotment>
    </div>
  )
}
Allotment
