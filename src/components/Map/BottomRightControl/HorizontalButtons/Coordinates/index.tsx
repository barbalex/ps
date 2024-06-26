import { useState, useEffect, memo, useCallback, useRef, useMemo } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { css } from '../../../../../css.ts'
import { ToggleMapCenter } from './ToggleMapCenter.tsx'
import { ChooseCrs } from './ChooseCrs/index.tsx'
import { epsgFrom4326 } from '../../../../../modules/epsgFrom4326.ts'
import { epsgTo4326 } from '../../../../../modules/epsgTo4326.ts'
import { useElectric } from '../../../../../ElectricProvider.tsx'
import { round } from '../../../../../modules/roundCoordinates.ts'

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

export const CoordinatesControl = memo(() => {
  const map = useMap()
  const bounds = map.getBounds()
  const center = bounds.getCenter()
  const { db } = useElectric()!
  const { project_id = '99999999-9999-9999-9999-999999999999' } = useParams()

  const { results: project } = useLiveQuery(
    db.projects.liveUnique({
      where: { project_id },
      select: { map_presentation_crs: true },
    }),
  )
  const projectMapPresentationCrs = project?.map_presentation_crs
  const { results: crs = [] } = useLiveQuery(
    db.crs.liveMany({ where: { project_id } }),
  )

  const [renderCount, setRenderCount] = useState(0)
  const rerender = useCallback(() => setRenderCount((prev) => prev + 1), [])

  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  const coordinates = useMemo(() => {
    if (!map) return null
    if (!center) return null
    const [x, y] = epsgFrom4326({
      x: center.lng,
      y: center.lat,
      projectMapPresentationCrs,
      crs: crs.find((cr) => cr.code === projectMapPresentationCrs),
    })
    return { x: round(x), y: round(y) }
  }, [center, crs, map, projectMapPresentationCrs])

  useMapEvent('dragend', rerender)

  const onChange = useCallback(
    (e) => {
      const name = e.target.name
      const value = parseFloat(e.target.value)
      // TODO: depending on projects.map_presentation_crs convert coordinates to wgs84
      // const [x, y] = epsgTo4326({ x: value, y: coordinates.y })
      const newCoordinates = { ...coordinates, [name]: value }
      // move map center to the new coordinates
      map.setView([newCoordinates.y, newCoordinates.x])
      // setCoordinates(newCoordinates)
    },
    [coordinates, map],
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

  console.log('CoordinatesControl', {
    coordinates,
    center,
    projectMapPresentationCrs,
    crs,
  })

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
      <ToggleMapCenter />
      <ChooseCrs />
    </div>
  )
})
