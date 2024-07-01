import { memo } from 'react'

import './resizer.css'

export const Resizer = memo(({ startResizing, isResizing }) => {
  console.log('Resizer.render')

  return (
    <div
      className="map-info-resizer"
      onMouseDown={startResizing}
      style={{
        ...(isResizing ? { backgroundColor: 'rgba(38, 82, 37, 0.9)' } : {}),
      }}
    />
  )
})
