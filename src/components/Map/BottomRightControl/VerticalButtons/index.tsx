import { useRef, useEffect } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Toolbar, ToolbarButton } = fluentUiReactComponents
import { FaMinus, FaPlus } from 'react-icons/fa'
import { useMap } from 'react-leaflet'
import { useIntl } from 'react-intl'

import { LocatingButton } from './LocatingButton.tsx'
import { EditingGeometryButton } from './EditingGeometryButton.tsx'
import styles from './index.module.css'

export const VerticalButtons = () => {
  const { formatMessage } = useIntl()
  const map = useMap()
  const zoomInLabel = formatMessage({
    id: 'mapZoomIn',
    defaultMessage: 'Heranzoomen',
  })
  const zoomOutLabel = formatMessage({
    id: 'mapZoomOut',
    defaultMessage: 'Herauszoomen',
  })

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
        <EditingGeometryButton />
        <LocatingButton />
        <ToolbarButton
          name="zoom_in"
          onClick={onClickZoomIn}
          aria-label={zoomInLabel}
          title={zoomInLabel}
          icon={<FaPlus />}
          size="large"
          className={styles.toolbarButton}
        />
        <ToolbarButton
          name="zoom_out"
          onClick={onClickZoomOut}
          aria-label={zoomOutLabel}
          title={zoomOutLabel}
          icon={<FaMinus />}
          size="large"
          className={styles.toolbarButton}
        />
      </Toolbar>
    </div>
  )
}
