import { memo, useCallback } from 'react'
import { useMap } from 'react-leaflet'

import { css } from '../../../../css.ts'

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
    const currentZoom = map.getZoom()
    const mapWidth = getMapWidthForLanInMeters(centerLat)
    const ratio =
      (pixelsInMeterWidth * mapWidth) / map.options.crs.scale(currentZoom)
    const crsScale = (pixelsInMeterWidth * mapWidth) / ratio
    const zoom = map.options.crs.zoom(crsScale)
    console.log('Item.onClick', {
      scale,
      ratio,
      crsScale,
      zoom,
      mapWidth,
      centerLat,
      bounds,
      currentZoom,
      pixelsInMeterWidth,
    })
    map.setZoom(zoom)
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
