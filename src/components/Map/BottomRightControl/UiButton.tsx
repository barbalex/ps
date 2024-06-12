import { useRef, useEffect, memo } from 'react'

const uibuttonStyle = {
  gridArea: 'uibutton',
  backgroundColor: 'white',
  margin: 0,
  cursor: 'auto',
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
