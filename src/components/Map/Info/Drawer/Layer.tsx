import { memo } from 'react'

const containerStyle = {
  borderBottom: '1px solid #ccc',
  padding: '10px 10px',
}
const titleStyle = {
  margin: 0,
  paddingBottom: 5,
  fontWeight: 'bold',
}
const propertyListStyle = {
  display: 'grid',
  gridTemplateColumns: '85px 1fr',
  fontSize: 'x-small !important',
  gap: 8,
}

export const Layer = memo(({ layerData }) => {
  return (
    <div style={containerStyle}>
      <div style={titleStyle}>{layerData.label}</div>
      <div style={propertyListStyle}>
        {(layerData.properties ?? []).map((property, i) => (
          <div key={`${i}/${property[0]}`}>
            <div>{property[0]}</div>
          </div>
        ))}
      </div>
    </div>
  )
})
