import { memo } from 'react'
import { createPortal } from 'react-dom'

import { css } from '../../../css.ts'
import { z } from 'zod'

const dropdownStyle = {
  borderBottom: 'none',
  background: 'white',
  maxHeight: '30em',
  overflowY: 'hidden',
  transition: 'max-height 0.2s ease-in-out',
  position: 'absolute',
  zIndex: 1000,
}

const itemStyle = {
  cursor: 'pointer',
  padding: '2px 5px',
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
          border: open ? '2px solid #777' : 'none',
          bottom: rootHeight - boundingRect.y,
          left: boundingRect.x,
        }}
      >
        {scales.map((scale) => (
          <div
            key={scale}
            style={css({
              ...itemStyle,
              on: ($) => [$('&:hover', { backgroundColor: 'lightgray' })],
            })}
            onClick={() => {
              // TODO: set scale
            }}
          >
            {scale.toLocaleString('de-ch')}
          </div>
        ))}
      </div>,
      document.getElementById('root'),
    )
  },
)
