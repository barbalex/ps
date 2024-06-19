import { useRef, useEffect, memo } from 'react'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

import { css } from '../../../css.ts'

const resizerStyle = {
  borderLeftWidth: '1px',
  borderLeft: 'solid',
  borderLeftColor: 'grey',
  width: '8px',
  cursor: 'col-resize',
  resize: 'horizontal',
  zIndex: 1,
}

// TODO: this solution is not perfect
// the vertical line should only be dragged horizontally
// but could not find a way to enforce this
// on the other hand: this is MUCH faster than resizing the drawer while dragging
export const Resize = memo(({ isResizing, resize, startResizing }) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const cleanup = draggable({
      element: ref.current,
      onDrop: resize,
      onDragStart: startResizing,
    })

    return cleanup
  }, [resize, startResizing])

  return (
    <div
      style={css({
        ...resizerStyle,
        ...(isResizing
          ? {
              borderLeftWidth: 4,
              borderLeftColor: 'black',
            }
          : {}),
        on: ($) => [$('&:hover', { borderLeftWidth: 4 })],
      })}
      ref={ref}
    />
  )
})
