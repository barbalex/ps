import styles from './Resizer.module.css'

export const Resizer = ({
  startResizing,
  isResizing,
}: {
  startResizing: () => void
  isResizing: boolean
}) => (
  <div
    className={`${styles.resizer}${isResizing ? ` ${styles.resizerActive}` : ''}`}
    onMouseDown={startResizing}
    // need to set this because the element looses the hover on drag
  />
)
