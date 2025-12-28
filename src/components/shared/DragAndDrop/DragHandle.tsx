import { MdDragIndicator } from 'react-icons/md'

import styles from './DragHandle.module.css'

// receives drag handle ref
export const DragHandle = ({ ref }) => (
  <div
    ref={ref}
    className={styles.dragHandle}
    onClick={(e) => e.preventDefault()}
    title="drag to reorder"
  >
    <MdDragIndicator className={styles.dragIndicator} />
  </div>
)
