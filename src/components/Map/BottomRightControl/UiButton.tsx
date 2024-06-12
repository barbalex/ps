import { useRef, useEffect, memo } from 'react'

const uibuttonStyle = {
  gridArea: 'uibutton',
  backgroundColor: 'white',
  margin: 0,
  cursor: 'auto',
  position: 'relative',
  pointerEvents: 'auto',
  userSelect: 'none',
  display: 'flex',
  flexWrap: 'nowrap',
  flexDirection: 'row',
  alignItems: 'center',
}

export const UiButton = memo(() => {
  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  return (
    <div style={uibuttonStyle} ref={ref}>
      uibotton
    </div>
  )
})
