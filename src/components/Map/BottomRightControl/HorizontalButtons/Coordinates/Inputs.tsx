import { useState, useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { pipe } from 'remeda'

import { on } from '../../../../../css.ts'
import { epsgTo4326 } from '../../../../../modules/epsgTo4326.ts'

const containerStyle = {
  display: 'flex',
  columnGap: 6,
  flexWrap: 'nowrap',
  paddingLeft: 7,
  paddingRight: 7,
}
const inputStyle = {
  border: 'none',
  padding: 0,
  fontSize: '0.75rem',
  // Need to set manual width for non-supporting browsers
  // only supported on chromium-based browsers, June 2024
  // only able to detect support in css, so using inputs.css for this
  // fieldSizing: 'content',
}

export const Inputs = ({
  coordinates: coordsIn,
  projectMapPresentationCrs,
}) => {
  const map = useMap()

  const [coordinates, setCoordinates] = useState(coordsIn)
  // update coordinates when coordsIn changes
  useEffect(() => {
    setCoordinates(coordsIn)
  }, [coordsIn])

  const onChange = (e) => {
    const name = e.target.name
    const value = parseFloat(e.target.value)
    const newCoordinates = { ...coordinates, [name]: value }
    setCoordinates(newCoordinates)
  }

  const onBlur = () => {
    const [x, y] = epsgTo4326({
      x: coordinates.x,
      y: coordinates.y,
      projectMapPresentationCrs,
    })
    map.setView([x, y])
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      onBlur()
      // unfocus input
      e.target.blur()
    }
  }

  return (
    <div style={containerStyle}>
      <input
        type="text"
        name="x"
        value={coordinates?.x ?? '...'}
        style={pipe(
          {
            ...inputStyle,
            textAlign: 'right',
          },
          on('&:focus-visible', {
            outline: 'none',
          }),
          on('@supports not (field-sizing: content)', {
            width: 63,
          }),
          on('@supports (field-sizing: content)', {
            fieldSizing: 'content',
          }),
        )}
        onBlur={onBlur}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      {`/`}
      <input
        type="text"
        name="y"
        value={coordinates?.y ?? '...'}
        style={pipe(
          {
            ...inputStyle,
            textAlign: 'left',
          },
          on('&:focus-visible', {
            outline: 'none',
          }),
          on('@supports not (field-sizing: content)', {
            width: 63,
          }),
          on('@supports (field-sizing: content)', {
            fieldSizing: 'content',
          }),
        )}
        onBlur={onBlur}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
