import './info.css'

const containerStyle = {
  padding: '5px 10px',
  backgroundColor: 'rgba(103, 216, 101, 0.07)',
}

export const Info = () => (
  <div
    style={containerStyle}
    tabIndex={-1}
  >
    <p>You can add multiple CRS.</p>
    <p>One of them can be set as the map presentation crs.</p>
    <p>It will be used to show coordinates in the map.</p>
    <p>Users can choose in the map one of the CRS'es you add here.</p>
  </div>
)
