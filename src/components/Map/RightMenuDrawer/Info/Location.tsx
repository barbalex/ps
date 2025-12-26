import styles from './Location.module.css'

export const Location = ({ mapInfo }) => {
  const lng = Math.round(mapInfo?.lng * 10000000) / 10000000
  const lat = Math.round(mapInfo?.lat * 10000000) / 10000000

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Location</h3>
      <p className={styles.p}>{`WGS84: ${lng} / ${lat}`}</p>
    </div>
  )
}
