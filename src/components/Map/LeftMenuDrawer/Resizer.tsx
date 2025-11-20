import './resizer.css'

export const Resizer = ({ startResizing, isResizing }) => (
  <div
    className="map-layers-resizer"
    onMouseDown={startResizing}
    // need to set background-color when resizing because the element looses the hover on drag
    style={{
      backgroundColor:
        isResizing ? 'rgba(38, 82, 37, 0.9)' : 'rgba(240, 255, 240, 1)',
    }}
  />
)
