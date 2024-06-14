import { useState, useEffect, memo, useCallback } from 'react'
import { useMap } from 'react-leaflet'

const options = {
  position: 'bottomleft',
  dropdownDirection: 'upward',
  className: 'map-control-scalebar',
  updateWhenIdle: true,
  ratio: true,
  ratioPrefix: '1: ',
  ratioCustomItemText: '1: type to set...',
  customScaleTitle: 'Choose Scale',
  ratioMenu: true,

  // If recalcOnZoomChange is false, then recalcOnPositionChange is always false.
  recalcOnPositionChange: true,
  recalcOnZoomChange: true,
  scales: [
    2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000, 2500000,
    5000000, 10000000,
  ],
  roundScales: undefined,
  adjustScales: false,
}

// Returns width of map in meters on specified latitude
const getMapWidthForLanInMeters = (currentLan) =>
  6378137 * 2 * Math.PI * Math.cos((currentLan * Math.PI) / 180)

const render = (ratio) => `1 : ${ratio?.toLocaleString('de-ch')}`

export const ScaleControl = memo(() => {
  const map = useMap()

  const [scale, setScale] = useState(1)

  // pixels per meter are needed if ratio: true.
  const [pixelsInMeterWidth, setPixelsInMeterWidth] = useState(0)
  useEffect(() => {
    const div = document.createElement('div')
    div.style.cssText =
      'position: absolute;  left: -100%;  top: -100%;  width: 100cm;'
    document.body.appendChild(div)
    const px = div.offsetWidth
    document.body.removeChild(div)
    setPixelsInMeterWidth(px)
  }, [])

  const updateScale = useCallback(() => {
    if (!(map.getSize().x > 0 && options.ratio)) return

    const bounds = map.getBounds()
    const centerLat = bounds.getCenter().lat
    const mapWidth = getMapWidthForLanInMeters(centerLat)
    const ratio =
      (pixelsInMeterWidth * mapWidth) / map.options.crs.scale(map.getZoom())
    const scaleText = Math.round(ratio)
    setScale(scaleText)
  })

  useEffect(() => {
    const moveEvent = options.updateWhenIdle ? 'moveend' : 'move'
    map.on(moveEvent, updateScale)
    const zoomEvent = options.updateWhenIdle ? 'zoomend' : 'zoom'
    map.on(zoomEvent, updateScale)

    return () => {
      map.off(moveEvent)
      map.off(zoomEvent)
    }
  }, [map, scale, updateScale])

  console.log('ScaleControl', { scale, pixelsInMeterWidth })

  return <div>ScaleControl</div>
})
