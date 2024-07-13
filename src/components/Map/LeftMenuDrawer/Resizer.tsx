import { memo } from 'react'

import './resizer.css'

export const Resizer = memo(({ startResizing, isResizing, isOpen }) => (
  <div
    className="map-layers-resizer"
    onMouseDown={startResizing}
    // need to set background-color when resizing because the element looses the hover on drag
    style={{
      backgroundColor: isResizing
        ? 'rgba(38, 82, 37, 0.9)'
        : !isOpen
        ? 'rgba(103, 216, 101, 0.2)'
        : 'white',
    }}
  />
))
