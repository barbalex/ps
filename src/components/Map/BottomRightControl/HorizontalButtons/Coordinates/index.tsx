import { useState, useEffect, memo, useCallback } from 'react'
import { useMap } from 'react-leaflet'

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  border: '1px solid black',
  padding: '2px 4px',
  background: 'rgba(255, 255, 255, 0.7)',
  textAlign: 'center',
  // ensure text always fits in the box
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: 72,
}

export const CoordinatesControl = memo(() => {
  const map = useMap()

  return <div style={containerStyle}>coordinates</div>
})
