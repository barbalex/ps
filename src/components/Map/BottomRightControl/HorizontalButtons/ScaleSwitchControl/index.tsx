import { useState, useEffect } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { useResizeDetector } from 'react-resize-detector'

import { Dropdown } from './Dropdown/index.tsx'
import { formatNumber } from '../../../../../modules/formatNumber.ts'

// Returns width of map in meters on specified latitude
const getMapWidthForLanInMeters = (currentLan) =>
  6378137 * 2 * Math.PI * Math.cos((currentLan * Math.PI) / 180)

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
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
  height: 30,
}

export const ScaleSwitchControl = () => {
  const map = useMap()

  const [scale, setScale] = useState(1)

  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

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

  const updateScale = () => {
    if (!(map.getSize().x > 0)) return

    const bounds = map.getBounds()
    const centerLat = bounds.getCenter().lat
    const mapWidth = getMapWidthForLanInMeters(centerLat)
    const ratio =
      (pixelsInMeterWidth * mapWidth) / map.options.crs.scale(map.getZoom())
    const scale = Math.round(ratio / 1000) * 1000
    setScale(scale)
  }

  useMapEvents({
    moveend: updateScale,
    zoomend: updateScale,
  })

  const onClick = () => setOpen(!open)

  const { width, ref } = useResizeDetector({
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 100,
    refreshOptions: { leading: false, trailing: true },
  })

  return (
    <div style={containerStyle}>
      <Dropdown
        open={open}
        boundingRect={ref.current?.getBoundingClientRect?.()}
        width={width}
        close={close}
        pixelsInMeterWidth={pixelsInMeterWidth}
      />
      <div
        style={textStyle}
        onClick={onClick}
        ref={ref}
      >
        {`1 : ${formatNumber(scale)}`}
      </div>
    </div>
  )
}
