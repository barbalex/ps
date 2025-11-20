import { createPortal } from 'react-dom'

import { Item } from './Item.tsx'

const dropdownStyle = {
  padding: '0 5px',
  borderBottom: 'none',
  background: 'white',
  maxHeight: '30em',
  overflowY: 'hidden',
  transition: 'max-height 0.2s ease-in-out',
  position: 'absolute',
  zIndex: 1000,
}

export const Dropdown = ({
  scales = [
    2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000, 2500000,
    5000000, 10000000,
  ],
  open,
  boundingRect,
  width,
  close,
  pixelsInMeterWidth,
}) => {
  if (!open) return null
  if (!boundingRect) return null

  const rootHeight = document.getElementById('root')?.clientHeight

  return createPortal(
    <div
      style={{
        ...dropdownStyle,
        maxHeight: open ? `${scales.length * 2}em` : 0,
        border: open ? '1px solid black' : 'none',
        borderBottom: 'none',
        bottom: rootHeight - boundingRect.y - 1,
        left: boundingRect.x,
        width,
      }}
    >
      {scales.map((scale) => (
        <Item
          key={scale}
          scale={scale}
          close={close}
          pixelsInMeterWidth={pixelsInMeterWidth}
        />
      ))}
    </div>,
    // insert below root to get all the style configs (font-family etc.)
    document.getElementById('router-container'),
  )
}
