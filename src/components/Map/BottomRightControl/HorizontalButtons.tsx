import { useRef, useEffect, memo } from 'react'

const horizontalbuttonsStyle = {
  gridArea: 'horizontalbuttons',
  backgroundColor: 'white',
  margin: 0,
  cursor: 'auto',
  position: 'relative',
  pointerEvents: 'auto',
  userSelect: 'none',
}

export const HorizontalButtons = memo(() => {
  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  return (
    <div style={horizontalbuttonsStyle} ref={ref}>
      horizontal buttons
    </div>
  )
})
