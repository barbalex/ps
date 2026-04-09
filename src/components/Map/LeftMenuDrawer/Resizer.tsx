import styles from './Resizer.module.css'

interface ResizerProps {
  startResizing: () => void
  isResizing: boolean
}

export const Resizer = ({ startResizing, isResizing }: ResizerProps) => (
  <div
    className={`${styles.resizer}${isResizing ? ` ${styles.resizerActive}` : ''}`}
    onMouseDown={startResizing}
  />
)
