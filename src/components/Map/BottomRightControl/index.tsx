import { useRef, useEffect, memo } from 'react'

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

const uibuttonStyle = {
  gridArea: 'uibutton',
  backgroundColor: 'white',
}
const verticalbuttonsStyle = {
  gridArea: 'verticalbuttons',
  backgroundColor: 'white',
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
          <div style={verticalbuttonsStyle}>vertical buttons</div>
          <div style={horizontalbuttonsStyle}>horizontal buttons</div>
          <div style={uibuttonStyle}>uibotton</div>
        </div>
      </div>
    </div>
  )
})
