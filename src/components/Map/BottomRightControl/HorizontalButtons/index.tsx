import { useRef, useEffect } from 'react'

import { ScaleSwitchControl } from './ScaleSwitchControl/index.tsx'
import { ScaleControl } from './ScaleControl.tsx'
import { CoordinatesControl } from './Coordinates/index.tsx'
import styles from './index.module.css'

// TODO: add: ruler, coordinates
export const HorizontalButtons = () => {
  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  return (
    <div className={styles.container} ref={ref}>
      <ScaleControl />
      <ScaleSwitchControl />
      <CoordinatesControl />
    </div>
  )
}
