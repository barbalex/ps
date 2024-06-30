import { memo } from 'react'

import './resizer.css'

export const Resizer = memo(({ startResizing,  }) => {
  console.log('Resizer.render')

  return (
    <div
      className="map-info-resizer"
      onMouseDown={startResizing}
    />
  )
})
