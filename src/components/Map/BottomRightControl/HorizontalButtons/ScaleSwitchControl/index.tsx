import { useState, useEffect, useCallback } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { Tooltip } from '@fluentui/react-components'
import { useIntl } from 'react-intl'

import { Dropdown } from './Dropdown/index.tsx'
import { formatNumber } from '../../../../../modules/formatNumber.ts'
import { useElementSize } from '../../../../../modules/useElementSize.ts'
import styles from './index.module.css'

// Returns width of map in meters on specified latitude
const getMapWidthForLanInMeters = (currentLan: number) =>
  6378137 * 2 * Math.PI * Math.cos((currentLan * Math.PI) / 180)

export const ScaleSwitchControl = () => {
  const map = useMap()
  const { formatMessage } = useIntl()

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

  const updateScale = useCallback(() => {
    if (!(map.getSize().x > 0)) return
    if (pixelsInMeterWidth <= 0) return

    const bounds = map.getBounds()
    const centerLat = bounds.getCenter().lat
    const mapWidth = getMapWidthForLanInMeters(centerLat)
    const ratio =
      (pixelsInMeterWidth * mapWidth) /
      map.options.crs!.scale(map.getZoom())
    const scale = Math.round(ratio / 1000) * 1000
    setScale(scale)
  }, [map, pixelsInMeterWidth])

  useMapEvents({
    moveend: updateScale,
    zoomend: updateScale,
  })

  // initial computation: restoring the persisted view fires no moveend,
  // so without this the switch keeps its initial "1 : 1" after a reload
  useEffect(() => {
    updateScale()
  }, [updateScale])

  const onClick = () => setOpen(!open)

  const { ref, width } = useElementSize<HTMLButtonElement>({
    delay: 100,
    height: false,
  })

  const boundingRect = ref.current?.getBoundingClientRect?.()

  return (
    <div className={styles.container}>
      <Dropdown
        open={open}
        boundingRect={boundingRect}
        /* the measured width is the trigger's content box; the dropdown
           is border-box and must match the trigger's outer width */
        width={typeof width === 'number' ? width + 10 : width}
        close={close}
        pixelsInMeterWidth={pixelsInMeterWidth}
      />
      <Tooltip relationship="description" content={formatMessage({
        id: 'mapChooseScale', defaultMessage: 'Kartenmassstab wählen',
      })}>
        <button type="button" aria-expanded={open} onClick={onClick} ref={ref} className={styles.text}>
          {`1 : ${formatNumber(scale)}`}
        </button>
      </Tooltip>
    </div>
  )
}
