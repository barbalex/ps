import { useState, memo, useCallback, useEffect } from 'react'
import { useMap } from 'react-leaflet'

import { css } from '../../../../../css.ts'
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
  fieldSizing: 'content',
}

export const Inputs = memo(
  ({ coordinates: coordsIn, projectMapPresentationCrs }) => {
    const map = useMap()

    const [coordinates, setCoordinates] = useState(coordsIn)
    // update coordinates when coordsIn changes
    useEffect(() => {
      setCoordinates(coordsIn)
    }, [coordsIn])

    const onChange = useCallback(
      (e) => {
        const name = e.target.name
        const value = parseFloat(e.target.value)
        const newCoordinates = { ...coordinates, [name]: value }
        setCoordinates(newCoordinates)
      },
      [coordinates],
    )

    const onBlur = useCallback(() => {
      const [x, y] = epsgTo4326({
        x: coordinates.x,
        y: coordinates.y,
        projectMapPresentationCrs,
      })
      map.setView([x, y])
    }, [coordinates.x, coordinates.y, map, projectMapPresentationCrs])

    const onKeyDown = useCallback(
      (e) => {
        if (e.key === 'Enter') {
          onBlur()
          // unfocus input
          e.target.blur()
        }
      },
      [onBlur],
    )

    return (
      <div style={containerStyle}>
        <input
          type="text"
          name="x"
          value={coordinates?.x ?? '...'}
          style={css({
            ...inputStyle,
            textAlign: 'right',
            on: ($) => [
              $('&:focus-visible', {
                outline: 'none',
              }),
            ],
          })}
          onBlur={onBlur}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
        {`/`}
        <input
          type="text"
          name="y"
          value={coordinates?.y ?? '...'}
          style={css({
            ...inputStyle,
            textAlign: 'left',
            on: ($) => [
              $('&:focus-visible', {
                outline: 'none',
              }),
            ],
          })}
          onBlur={onBlur}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
      </div>
    )
  },
)
