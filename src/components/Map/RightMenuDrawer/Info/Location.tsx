const containerStyle = {
  borderBottom: '1px solid #ccc',
  padding: '10px 10px',
}
const titleStyle = {
  margin: 0,
  paddingBottom: 5,
  fontSize: 'medium',
}
const pStyle = {
  margin: 0,
  fontSize: 'small',
}

export const Location = ({ mapInfo }) => {
  const lng = Math.round(mapInfo?.lng * 10000000) / 10000000
  const lat = Math.round(mapInfo?.lat * 10000000) / 10000000

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>Location</h3>
      <p style={pStyle}>{`WGS84: ${lng} / ${lat}`}</p>
    </div>
  )
}
