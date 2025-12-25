import { useMap } from 'react-leaflet'

import { formatNumber } from '../../../../../../modules/formatNumber.ts'
import styles from './Item.module.css'

// Returns width of map in meters on specified latitude
const getMapWidthForLanInMeters = (currentLan) =>
  6378137 * 2 * Math.PI * Math.cos((currentLan * Math.PI) / 180)

export const Item = ({ scale, close, pixelsInMeterWidth }) => {
  const map = useMap()

  const onClick = () => {
    const bounds = map.getBounds()
    const centerLat = bounds.getCenter().lat
    const mapWidth = getMapWidthForLanInMeters(centerLat)
    const crsScale = (pixelsInMeterWidth * mapWidth) / scale
    const newZoom = map.options.crs.zoom(crsScale)
    map.setZoom(newZoom)
    close()
  }

  return (
    <div className={styles.item} onClick={onClick}>
      {`1 : ${formatNumber(scale)}`}
    </div>
  )
}
