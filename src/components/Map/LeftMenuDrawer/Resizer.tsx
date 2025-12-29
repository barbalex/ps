import styles from './Resizer.module.css'

interface ResizerProps {
  startResizing: () => void
  isResizing: boolean
}

export const Resizer = ({ startResizing, isResizing }: ResizerProps) => (
  <div
    className={styles.resizer}
    onMouseDown={startResizing}
    // need to set background-color when resizing because the element looses the hover on drag
    style={{
      backgroundColor: isResizing
        ? 'rgba(38, 82, 37, 0.9)'
        : 'rgba(240, 255, 240, 1)',
    }}
  />
)
