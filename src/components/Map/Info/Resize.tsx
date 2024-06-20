import { useRef, useEffect, memo } from 'react'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

import { css } from '../../../css.ts'

const resizerStyle = {
  backgroundColor: 'grey',
  zIndex: 1,
}

// TODO: this solution is not perfect
// the vertical line should only be dragged horizontally
// but could not find a way to enforce this
// on the other hand: this is MUCH faster than resizing the drawer while dragging
export const Resize = memo(({ resize, isMobile }) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const cleanup = draggable({
      element: ref.current,
      onDrop: resize,
    })

    return cleanup
  }, [resize])

  return (
    <div
      style={css({
        ...resizerStyle,
        cursor: isMobile ? 'row-resize' : 'col-resize',
        ...(isMobile ? { height: 1 } : { width: 1 }),
        on: ($) => [
          $('&:hover', {
            ...(isMobile ? { height: 8 } : { width: 8 }),
            backgroundColor: 'rgba(38, 82, 37, 0.9)',
          }),
        ],
      })}
      ref={ref}
    />
  )
})
