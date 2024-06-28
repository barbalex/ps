import { memo } from 'react'

import './info.css'

const containerStyle = {
  padding: '5px 10px',
  backgroundColor: 'rgba(103, 216, 101, 0.07)',
}

export const Info = memo(() => (
  <div style={containerStyle} tabIndex={-1}>
    <p>These are the CRS you can add to a project.</p>
  </div>
))
