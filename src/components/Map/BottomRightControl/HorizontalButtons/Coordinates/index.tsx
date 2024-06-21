import { useState, useEffect, memo, useCallback, useRef } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'
import { css } from '../../../../../css.ts'
import { ToggleButton } from '@fluentui/react-components'
import { MdCenterFocusWeak } from 'react-icons/md'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../../../../ElectricProvider.tsx'

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
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const showMapCenter = appState?.map_show_center ?? false

  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  const [coordinates, setCoordinates] = useState(null)
  useEffect(() => {
    // on start, set initial coordinates to map center
    const bounds = map.getBounds()
    const center = bounds.getCenter()
    setCoordinates({ x: round(center.lng), y: round(center.lat) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setCenterCoords = useCallback(() => {
    // const [x, y] = epsg4326to2056(e.latlng.lng, e.latlng.lat)
    const bounds = map.getBounds()
    const center = bounds.getCenter()
    setCoordinates({ x: round(center.lng), y: round(center.lat) })
  }, [map])

  const onChange = useCallback(
    (e) => {
      const name = e.target.name
      const value = parseFloat(e.target.value)
      console.log('centerMap', { e, name, value })
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

  useMapEvent('dragend', setCenterCoords)

  const onClickShowMapCenter = useCallback(() => {
    db.app_states.update({
      where: { app_state_id: appState?.app_state_id },
      data: { map_show_center: !showMapCenter },
    })
  }, [db.app_states, appState?.app_state_id, showMapCenter])

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
      <ToggleButton
        checked={showMapCenter}
        onClick={onClickShowMapCenter}
        icon={<MdCenterFocusWeak />}
        aria-label={showMapCenter ? 'Hide map center' : 'Show map center'}
        title={showMapCenter ? 'Hide map center' : 'Show map center'}
        size="small"
      />
    </div>
  )
})
