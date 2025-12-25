import { useRef, useEffect } from 'react'
import { Toolbar, ToolbarButton } from '@fluentui/react-components'
import { FaMinus, FaPlus } from 'react-icons/fa'
import { useMap } from 'react-leaflet'

import { LocatingButton } from './LocatingButton.tsx'
import styles from './index.module.css'

export const VerticalButtons = () => {
  const map = useMap()

  const onClickZoomIn = () => map.zoomIn()

  const onClickZoomOut = () => map.zoomOut()

  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  // TODO: add: zoom to project bounds
  return (
    <div className={styles.container} ref={ref}>
      <Toolbar
        vertical
        aria-label="vertical toolbar"
        className={styles.toolbar}
      >
        <LocatingButton />
        <ToolbarButton
          name="zoom_in"
          onClick={onClickZoomIn}
          aria-label="Zoom in"
          title="Zoom in"
          icon={<FaPlus />}
          size="large"
          className={styles.toolbarButton}
        />
        <ToolbarButton
          name="zoom_out"
          onClick={onClickZoomOut}
          aria-label="Zoom out"
          title="Zoom out"
          icon={<FaMinus />}
          size="large"
          className={styles.toolbarButton}
        />
      </Toolbar>
    </div>
  )
}
