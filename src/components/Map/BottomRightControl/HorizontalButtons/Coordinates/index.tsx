import { useState, useEffect, memo, useCallback, useRef } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { css } from '../../../../../css.ts'
import debounce from 'lodash/debounce'

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
const inputStyle = {
  border: 'none',
  background: 'transparent',
  width: 80,
  textAlign: 'center',
  padding: 0,
  margin: 0,
}

const round = (num) => Math.round(num * 10000000) / 10000000

export const CoordinatesControl = memo(() => {
  const map = useMap()

  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  useEffect(() => {
    // on start, set initial coordinates to map center
    const bounds = map.getBounds()
    const center = bounds.getCenter()
    setCoordinates({ x: round(center.lng), y: round(center.lat) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // const [controlType, setControlType] = useState('coordinates')
  const [coordinates, setCoordinates] = useState(null)

  const setMouseCoords = useCallback((e) => {
    // const [x, y] = epsg4326to2056(e.latlng.lng, e.latlng.lat)
    setCoordinates({ x: round(e.latlng.lng), y: round(e.latlng.lat) })
  }, [])

  const onMouseMove = debounce(setMouseCoords, 50)

  useMapEvents({
    mousemove(e) {
      onMouseMove(e)
    },
  })

  return (
    <div style={containerStyle} ref={ref}>
      <input
        type="text"
        value={coordinates?.x ?? '...'}
        style={css({
          ...inputStyle,
          on: ($) => [
            $('&:focus-visible', {
              outline: 'none',
            }),
          ],
        })}
      />
      {` / `}
      <input
        type="text"
        value={coordinates?.y ?? '...'}
        style={css({
          ...inputStyle,
          on: ($) => [
            $('&:focus-visible', {
              outline: 'none',
            }),
          ],
        })}
      />
    </div>
  )
})
