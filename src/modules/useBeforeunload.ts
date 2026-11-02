import { useEffect, useRef } from 'react'

// runs a cleanup handler right before the page unloads
// (none of the handlers shows the browser's leave-site dialog,
// so unlike react-beforeunload there is no preventDefault machinery)
export const useBeforeunload = (handler: () => void) => {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    const listener = () => handlerRef.current()
    window.addEventListener('beforeunload', listener)
    return () => window.removeEventListener('beforeunload', listener)
  }, [])
}
