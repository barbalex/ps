import { useRef, useEffect, memo } from 'react'

import { UiButton } from './UiButton.tsx'
import { VerticalButtons } from './VerticalButtons.tsx'
import { HorizontalButtons } from './HorizontalButtons.tsx'

const containerStyle = {
  position: 'absolute',
  zIndex: 1000,
  pointerEvents: 'none',
  right: 10,
  bottom: 10,
  display: 'grid',
  gridTemplateColumns: '1fr 50px',
  gridTemplateRows: '1fr 50px',
  gridTemplateAreas: `
    '. verticalbuttons'
    'horizontalbuttons uibutton'
  `,
  gap: 5,
  justifyItems: 'center',
  alignItems: 'stretch',
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
    <div style={containerStyle} ref={ref}>
      <VerticalButtons />
      <HorizontalButtons />
      <UiButton />
    </div>
  )
})
