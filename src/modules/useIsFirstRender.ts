import { useRef } from 'react'

// true only on the very first render of the component
export const useIsFirstRender = () => {
  const renderRef = useRef(true)

  if (renderRef.current === true) {
    renderRef.current = false
    return true
  }

  return renderRef.current
}
