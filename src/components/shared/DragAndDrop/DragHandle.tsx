import { MdDragIndicator } from 'react-icons/md'

const dragHandleStyle = {
  display: 'flex',
  alignItems: 'center',
}
const dragIndicatorStyle = {
  fontSize: 'x-large',
  color: 'rgba(55, 118, 28, 0.6)',
  paddingRight: 5,
  cursor: 'grab',
}

// receives drag handle ref
export const DragHandle = ({ ref }) => (
  <div
    ref={ref}
    style={dragHandleStyle}
    onClick={(e) => e.preventDefault()}
    title="drag to reorder"
  >
    <MdDragIndicator style={dragIndicatorStyle} />
  </div>
)
