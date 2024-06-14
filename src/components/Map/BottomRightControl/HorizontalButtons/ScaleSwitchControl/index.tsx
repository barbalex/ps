import { useState, useEffect, memo, useCallback } from 'react'
import { useMap } from 'react-leaflet'
import { useResizeDetector } from 'react-resize-detector'

import { Dropdown } from './Dropdown/index.tsx'

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

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  fontSize: '1em',
}
const textStyle = {
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

export const ScaleSwitchControl = memo(() => {
  const map = useMap()

  const [scale, setScale] = useState(1)

  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

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
  }, [scale])

  const updateScale = useCallback(() => {
    if (!(map.getSize().x > 0 && options.ratio)) return

    const bounds = map.getBounds()
    const centerLat = bounds.getCenter().lat
    const mapWidth = getMapWidthForLanInMeters(centerLat)
    const ratio =
      (pixelsInMeterWidth * mapWidth) / map.options.crs.scale(map.getZoom())
    const scale = Math.round(ratio / 1000) * 1000
    setScale(scale)
  }, [map, pixelsInMeterWidth])

  useEffect(() => {
    const moveEvent = options.updateWhenIdle ? 'moveend' : 'move'
    map.on(moveEvent, updateScale)

    const zoomEvent = options.updateWhenIdle ? 'zoomend' : 'zoom'
    map.on(zoomEvent, updateScale)

    map.whenReady(updateScale)

    return () => {
      map.off(moveEvent)
      map.off(zoomEvent)
    }
  }, [map, scale, updateScale])

  const onClick = useCallback(() => setOpen(!open), [open])

  const { width, ref } = useResizeDetector({
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 100,
    refreshOptions: { leading: false, trailing: true },
  })

  return (
    <div style={containerStyle}>
      <Dropdown
        scales={options.scales}
        open={open}
        boundingRect={ref.current?.getBoundingClientRect?.()}
        width={width}
        close={close}
        pixelsInMeterWidth={pixelsInMeterWidth}
      />
      <div style={textStyle} onClick={onClick} ref={ref}>
        {`1 : ${scale?.toLocaleString('de-ch')}`}
      </div>
    </div>
  )
})
