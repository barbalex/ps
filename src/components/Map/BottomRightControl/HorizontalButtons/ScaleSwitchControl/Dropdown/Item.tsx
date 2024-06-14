import { memo, useCallback } from 'react'
import { useMap } from 'react-leaflet'

import { css } from '../../../../../../css.ts'

const itemStyle = {
  cursor: 'pointer',
  padding: '2px 0',
  fontSize: '0.9em',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

// Returns width of map in meters on specified latitude
const getMapWidthForLanInMeters = (currentLan) =>
  6378137 * 2 * Math.PI * Math.cos((currentLan * Math.PI) / 180)

export const Item = memo(({ scale, close, pixelsInMeterWidth }) => {
  const map = useMap()

  const onClick = useCallback(() => {
    const bounds = map.getBounds()
    const centerLat = bounds.getCenter().lat
    const mapWidth = getMapWidthForLanInMeters(centerLat)
    const crsScale = (pixelsInMeterWidth * mapWidth) / scale
    const newZoom = map.options.crs.zoom(crsScale)
    map.setZoom(newZoom)
    close()
  }, [close, map, pixelsInMeterWidth, scale])

  return (
    <div
      style={css({
        ...itemStyle,
        on: ($) => [$('&:hover', { backgroundColor: 'lightgray' })],
      })}
      onClick={onClick}
    >
      {`1 : ${scale.toLocaleString('de-ch')}`}
    </div>
  )
})
