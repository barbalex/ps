import { memo } from 'react'
import { createPortal } from 'react-dom'

import { Item } from './Item.tsx'

const dropdownStyle = {
  borderBottom: 'none',
  background: 'white',
  maxHeight: '30em',
  overflowY: 'hidden',
  transition: 'max-height 0.2s ease-in-out',
  position: 'absolute',
  width: 100,
  zIndex: 1000,
}

export const Dropdown = memo(
  ({
    scales = [
      2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000, 2500000,
      5000000, 10000000,
    ],
    open,
    boundingRect,
  }) => {
    if (!open) return null
    if (!boundingRect) return null

    const rootHeight = document.getElementById('root')?.clientHeight

    console.log('boundingRect', {
      boundingRect,
      bottom: boundingRect.y + window.scrollY,
      left: boundingRect.x,
      rootHeight,
    })

    return createPortal(
      <div
        style={{
          ...dropdownStyle,
          maxHeight: open ? `${scales.length * 2}em` : 0,
          border: open ? '1.5px solid #777' : 'none',
          borderBottom: 'none',
          bottom: rootHeight - boundingRect.y - 1,
          left: boundingRect.x,
        }}
      >
        {scales.map((scale) => (
          <Item key={scale} scale={scale} />
        ))}
      </div>,
      document.getElementById('router-container'),
    )
  },
)
