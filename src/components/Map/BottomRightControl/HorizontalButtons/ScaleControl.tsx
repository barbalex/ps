import { useState, useEffect, useCallback } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'

const maxWidth = 110

const getRoundNum = (num) => {
  const pow10 = Math.pow(10, `${Math.floor(num)}`.length - 1)
  let d = num / pow10

  d =
    d >= 10 ? 10
    : d >= 5 ? 5
    : d >= 3 ? 3
    : d >= 2 ? 2
    : 1

  return pow10 * d
}

const style = {
  border: '1px solid black',
  borderTop: 'none',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2px 0',
}

export const ScaleControl = () => {
  const map = useMap()

  const [text, setText] = useState('')
  const [width, setWidth] = useState(0)

  const update = useCallback(() => {
    if (!map.getSize().y > 0) return

    const y = map.getSize().y / 2
    const maxMeters = map.distance(
      map.containerPointToLatLng([0, y]),
      map.containerPointToLatLng([maxWidth, y]),
    )
    const meters = getRoundNum(maxMeters)

    const text = meters < 1000 ? `${meters} m` : `${meters / 1000} km`
    const width = Math.round((maxWidth * meters) / maxMeters)
    setText(text)
    setWidth(width)
  }, [map])

  useMapEvents({
    move: update,
    zoom: update,
  })

  useEffect(() => {
    map.whenReady(update)
  }, [map, update])

  return <div style={{ ...style, width }}>{text}</div>
}
