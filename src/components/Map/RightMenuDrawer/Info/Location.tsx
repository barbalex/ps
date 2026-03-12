import { epsgFrom4326 } from '../../../../modules/epsgFrom4326.ts'
import { round } from '../../../../modules/roundCoordinates.ts'
import styles from './Location.module.css'

export const Location = ({
  mapInfo,
  projectMapPresentationCrs,
  projectCrs,
}) => {
  const crs = projectCrs?.find((cr) => cr.code === projectMapPresentationCrs)
  const [x, y] = epsgFrom4326({
    x: mapInfo?.lng,
    y: mapInfo?.lat,
    projectMapPresentationCrs,
    crs,
  })
  const wgsLng = round(mapInfo?.lng)
  const wgsLat = round(mapInfo?.lat)

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Location</h3>
      <div className={styles.grid}>
        <span className={styles.label}>WGS84</span>
        <span className={styles.value}>{wgsLng}</span>
        <span className={styles.value}>{wgsLat}</span>
        {projectMapPresentationCrs && (
          <>
            <span className={styles.label}>{projectMapPresentationCrs}</span>
            <span className={styles.value}>{round(x)}</span>
            <span className={styles.value}>{round(y)}</span>
          </>
        )}
      </div>
    </div>
  )
}
