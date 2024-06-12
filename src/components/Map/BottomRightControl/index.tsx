import { useRef, useEffect, memo } from 'react'

import { UiButton } from './UiButton.tsx'
import { VerticalButtons } from './VerticalButtons.tsx'

const innerDivStyle = {
  border: 'none !important',
  boxShadow: 'none !important',
  // float children right
  display: 'grid',
  gridTemplateColumns: '1fr 50px',
  gridTemplateRows: '1fr 50px',
  gridTemplateAreas: `
    '. verticalbuttons'
    'horizontalbuttons uibutton'
  `,
  gap: 5,
}

const horizontalbuttonsStyle = {
  gridArea: 'horizontalbuttons',
  backgroundColor: 'white',
}

// TODO: only prevent click propagation in active grid areas
export const BottomRightControl = memo(() => {
  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  return (
    <div className="leaflet-control-container first" ref={ref}>
      <div className="leaflet-bottom leaflet-right">
        <div style={innerDivStyle} className="leaflet-control leaflet-bar">
          <VerticalButtons />
          <div style={horizontalbuttonsStyle}>horizontal buttons</div>
          <UiButton />
        </div>
      </div>
    </div>
  )
})
