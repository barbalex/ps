import { memo } from 'react'

import './resizer.css'

export const Resizer = memo(({ startResizing, isResizing }) => (
  <div
    className="map-layers-resizer"
    onMouseDown={startResizing}
    // need to set this because the element looses the hover on drag
    style={{
      ...(isResizing ? { backgroundColor: 'rgba(38, 82, 37, 0.9)' } : {}),
    }}
  />
))
