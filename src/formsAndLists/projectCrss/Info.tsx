import styles from './Info.module.css'

export const Info = () => (
  <div
    className={styles.container}
    tabIndex={-1}
  >
    <p>You can add multiple CRS.</p>
    <p>One of them can be set as the map presentation crs.</p>
    <p>It will be used to show coordinates in the map.</p>
    <p>Users can choose in the map one of the CRS'es you add here.</p>
    <p>If no CRS is selected, WGS84 will be used by default.</p>
  </div>
)
