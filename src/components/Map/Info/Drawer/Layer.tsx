import { memo, Fragment } from 'react'

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
  gridTemplateColumns: 'minmax(100px, 30%) 1fr',
  // gap: 5,
}
const textStyle = {
  padding: 5,
  fontSize: '0.9em',
  lineHeight: '1.4em',
  overflowWrap: 'anywhere',
  color: 'black',
}
const labelStyle = {
  ...textStyle,
  fontWeight: 'bold',
  color: 'rgba(0, 0, 0, 0.5)',
  borderRight: '1px solid rgba(0, 0, 0, 0.2)',
}

export const Layer = memo(({ layerData }) => {
  const { label, properties = [] } = layerData

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>{label}</div>
      <div style={propertyListStyle}>
        {properties.map((p, i) => {
          const key = p[0]
          const value = p[1]
          const backgroundColor = i % 2 === 0 ? 'rgba(0, 0, 0, 0.05)' : 'unset'

          return (
            <Fragment key={`${i}/${key}`}>
              <div style={{ ...labelStyle, backgroundColor }}>{key}</div>
              <div style={{ ...textStyle, backgroundColor }}>{value}</div>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
})
