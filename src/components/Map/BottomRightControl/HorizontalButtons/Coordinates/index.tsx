import { useState, useEffect, memo, useCallback, useRef } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'
import { css } from '../../../../../css.ts'

import { ToggleMapCenter } from './ToggleMapCenter.tsx'
import { ChooseCrs } from './ChooseCrs/index.tsx'

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
  fontSize: '0.75rem',
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

  const [coordinates, setCoordinates] = useState(null)
  const setCenterCoords = useCallback(() => {
    // const [x, y] = epsg4326to2056(e.latlng.lng, e.latlng.lat)
    const bounds = map.getBounds()
    const center = bounds.getCenter()
    // TODO: depending on projects.map_presentation_crs convert coordinates to wgs84
    setCoordinates({ x: round(center.lng), y: round(center.lat) })
  }, [map, setCoordinates])
  useMapEvent('dragend', setCenterCoords)

  useEffect(() => {
    // on start, set initial coordinates to map center
    const bounds = map.getBounds()
    const center = bounds.getCenter()
    // TODO: depending on projects.map_presentation_crs convert coordinates to presentation crs
    // const [x, y] = epsg4326to2056(e.latlng.lng, e.latlng.lat)
    console.log('setting initial coordinates to:', center)
    setCoordinates({ x: round(center.lng), y: round(center.lat) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = useCallback(
    (e) => {
      const name = e.target.name
      const value = parseFloat(e.target.value)
      // TODO: depending on projects.map_presentation_crs convert coordinates to wgs84
      const newCoordinates = { ...coordinates, [name]: value }
      setCoordinates(newCoordinates)
    },
    [coordinates],
  )
  const onBlur = useCallback(
    () => map.setView([coordinates.y, coordinates.x]),
    [coordinates?.x, coordinates?.y, map],
  )
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

  console.log('rendering CoordinatesControl, coordinates:', coordinates)

  return (
    <div style={containerStyle} ref={ref}>
      <input
        type="text"
        name="x"
        value={coordinates?.x ?? '...'}
        style={css({
          ...inputStyle,
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
      {` / `}
      <input
        type="text"
        name="y"
        value={coordinates?.y ?? '...'}
        style={css({
          ...inputStyle,
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
      <ToggleMapCenter setCoordinates={setCoordinates} />
      <ChooseCrs />
    </div>
  )
})
