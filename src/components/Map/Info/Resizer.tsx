import { memo } from 'react'

import './resizer.css'

export const Resizer = memo(({ startResizing }) => (
  <div className="map-info-resizer" onMouseDown={startResizing} />
))
