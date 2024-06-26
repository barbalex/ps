import { useState, useEffect, memo, useCallback, useRef } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'
import { useParams } from 'react-router-dom'

import { css } from '../../../../../css.ts'
import { ToggleMapCenter } from './ToggleMapCenter.tsx'
import { ChooseCrs } from './ChooseCrs/index.tsx'
import { epsgFrom4326 } from '../../../../../modules/epsgFrom4326.ts'
import { epsgTo4326 } from '../../../../../modules/epsgTo4326.ts'
import { useElectric } from '../../../../../ElectricProvider.tsx'

const containerStyle = {
  display: 'flex',
  columnGap: 5,
  flexWrap: 'nowrap',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  border: '1px solid black',
  padding: '2px 4px',
  background: 'rgba(255, 255, 255, 0.7)',
  // ensure text always fits in the box
  // whiteSpace: 'nowrap',
  // overflow: 'hidden',
  // textOverflow: 'ellipsis',
  // minWidth: 72,
}
const inputStyle = {
  flexBasis: 'content',
  flexShrink: 1,
  flexGrow: 0,
  border: 'none',
  background: 'transparent',
  // width: 80,
  padding: 0,
  margin: 0,
  fontSize: '0.75rem',
}

const round = (num) => Math.round(num * 10000000) / 10000000

export const CoordinatesControl = memo(() => {
  const map = useMap()
  const { db } = useElectric()!
  const { project_id } = useParams()

  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  const [coordinates, setCoordinates] = useState(null)
  const setCenterCoords = useCallback(async () => {
    const bounds = map.getBounds()
    const center = bounds.getCenter()
    console.log('Coordinates.setCenterCoords, center:', center)
    const [x, y] = await epsgFrom4326({
      x: center.lng,
      y: center.lat,
      db,
      project_id,
    })
    // depending on projects.map_presentation_crs convert coordinates to wgs84
    setCoordinates({ x: round(x), y: round(y) })
  }, [db, map, project_id])
  useMapEvent('dragend', setCenterCoords)

  useEffect(() => {
    const run = async () => {
      // on start, set initial coordinates to map center
      const bounds = map.getBounds()
      const center = bounds.getCenter()
      // depending on projects.map_presentation_crs convert coordinates to presentation crs
      const [x, y] = await epsgFrom4326({
        x: center.lng,
        y: center.lat,
        db,
        project_id,
      })
      console.log('Coordinates.useEffect', { center, x, y })
      setCoordinates({ x: round(x), y: round(y) })
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = useCallback(
    (e) => {
      const name = e.target.name
      const value = parseFloat(e.target.value)
      // TODO: depending on projects.map_presentation_crs convert coordinates to wgs84
      // const [x, y] = epsgTo4326({ x: value, y: coordinates.y })
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
      {` / `}
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
      <ToggleMapCenter setCoordinates={setCoordinates} />
      <ChooseCrs />
    </div>
  )
})
