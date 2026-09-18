import { epsgFrom4326 } from '../../../../modules/epsgFrom4326.ts'
import { round, formatCoordinate } from '../../../../modules/roundCoordinates.ts'
import type { MapInfo } from '../../../../store.ts'
import type ProjectCrs from '../../../../models/public/ProjectCrs.ts'
import styles from './Location.module.css'

type Props = {
  mapInfo: MapInfo | null
  projectMapPresentationCrs?: string | null
  projectCrs?: ProjectCrs[]
}

export const Location = ({
  mapInfo,
  projectMapPresentationCrs,
  projectCrs,
}: Props) => {
  const crs = projectCrs?.find((cr) => cr.code === projectMapPresentationCrs)
  const [x, y] = epsgFrom4326({
    x: mapInfo?.lng,
    y: mapInfo?.lat,
    projectMapPresentationCrs,
    crs,
  })
  const wgsLng = round(mapInfo?.lng as number)
  const wgsLat = round(mapInfo?.lat as number)

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Location</h3>
      <div className={styles.grid}>
        <span className={styles.label}>WGS84</span>
        <span className={styles.value}>{formatCoordinate(wgsLng)}</span>
        <span className={styles.value}>{formatCoordinate(wgsLat)}</span>
        {projectMapPresentationCrs && (
          <>
            <span className={styles.label}>{projectMapPresentationCrs}</span>
            <span className={styles.value}>
              {formatCoordinate(round(x as number))}
            </span>
            <span className={styles.value}>
              {formatCoordinate(round(y as number))}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
