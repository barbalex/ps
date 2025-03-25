import { memo, useCallback } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import { useAtom } from 'jotai'

import { setDesktopViewAtom } from '../../store.ts'

const style = {
  width: '100%',
  height: 0,
}

// this sets the isDesktopViewAtom depending on the width of this component,
// in contrast to: window.innerWidth
export const IsDesktopViewSetter = memo(() => {
  const [, setDesktopView] = useAtom(setDesktopViewAtom)

  const onResize = useCallback(
    ({ width }) => setDesktopView(width),
    [setDesktopView],
  )

  const { ref } = useResizeDetector({
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 300,
    refreshOptions: { leading: false, trailing: true },
    onResize,
  })

  return (
    <div
      style={style}
      ref={ref}
    />
  )
})
