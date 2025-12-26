import styles from './Resizer.module.css'

export const Resizer = ({ startResizing, isResizing }) => (
  <div
    className={styles.resizer}
    onMouseDown={startResizing}
    // need to set this because the element looses the hover on drag
    style={{
      ...(isResizing ? { backgroundColor: 'rgba(38, 82, 37, 0.9)' } : {}),
    }}
  />
)
