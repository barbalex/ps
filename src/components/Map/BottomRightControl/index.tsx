import { useAtomValue } from 'jotai'

import { UiButton } from './UiButton.tsx'
import { VerticalButtons } from './VerticalButtons/index.tsx'
import { HorizontalButtons } from './HorizontalButtons/index.tsx'
import { mapHideUiAtom } from '../../../store.ts'
import styles from './index.module.css'

export const BottomRightControl = () => {
  const hideMapUi = useAtomValue(mapHideUiAtom)

  return (
    // the global map-own-controls class lets mapExport.ts hide the
    // self-built controls while the map is captured (same purpose as
    // leaflet's own .leaflet-control-container)
    <div className={`${styles.container} map-own-controls`}>
      {!hideMapUi && (
        <>
          <VerticalButtons />
          <HorizontalButtons />
        </>
      )}
      <UiButton />
    </div>
  )
}
