import { useRef, useEffect, memo, useCallback } from 'react'
import { Toolbar, ToolbarButton } from '@fluentui/react-components'
import { FaMinus, FaPlus } from 'react-icons/fa'
import { useMap } from 'react-leaflet'

import { LocatingButton } from './LocatingButton.tsx'

const verticalbuttonsStyle = {
  gridArea: 'verticalbuttons',
  zIndex: 1000,
  margin: 0,
  cursor: 'auto',
  position: 'relative',
  pointerEvents: 'auto',
  userSelect: 'none',
  display: 'flex',
  flexWrap: 'nowrap',
  flexDirection: 'column',
  justifyItems: 'center',
  justifyContent: 'center',
  alignItems: 'center',
}
const toolbarButtonStyle = {
  backgroundColor: 'white',
  border: '0.666667px solid rgb(209, 209, 209)',
}

export const VerticalButtons = memo(() => {
  const map = useMap()

  const onClickZoomIn = useCallback(() => map.zoomIn(), [map])

  const onClickZoomOut = useCallback(() => map.zoomOut(), [map])

  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  // TODO: add: zoom to project bounds
  return (
    <div style={verticalbuttonsStyle} ref={ref}>
      <Toolbar vertical aria-label="vertical toolbar">
        <LocatingButton />
        <ToolbarButton
          name="zoom_in"
          onClick={onClickZoomIn}
          aria-label="Zoom in"
          title="Zoom in"
          icon={<FaPlus />}
          size="large"
          style={toolbarButtonStyle}
        />
        <ToolbarButton
          name="zoom_out"
          onClick={onClickZoomOut}
          aria-label="Zoom out"
          title="Zoom out"
          icon={<FaMinus />}
          size="large"
          style={toolbarButtonStyle}
        />
      </Toolbar>
    </div>
  )
})
