import { useRef, useEffect, memo } from 'react'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

import { css } from '../../../css.ts'

const resizerStyle = {
  backgroundColor: 'grey',
  width: 1,
  cursor: 'col-resize',
  zIndex: 1,
}

// TODO: this solution is not perfect
// the vertical line should only be dragged horizontally
// but could not find a way to enforce this
// on the other hand: this is MUCH faster than resizing the drawer while dragging
export const Resize = memo(({ resize }) => {
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
        on: ($) => [
          $('&:hover', {
            width: 8,
            backgroundColor: 'rgba(38, 82, 37, 0.9)',
          }),
        ],
      })}
      ref={ref}
    />
  )
})
