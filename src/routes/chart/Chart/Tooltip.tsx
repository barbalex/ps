import sortBy from 'lodash/sortBy'

const popupStyle = {
  backgroundColor: 'white',
  border: '1px solid rgba(38, 82, 37, 0.9)',
  opacity: 0.8,
  padding: 8,
}
const titleStyle = {
  fontSize: '1em',
  fontWeight: 700,
}
const rowStyle = {
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  fontSize: '0.8em',
  fontWeight: 700,
  // color: passed in dynamically
}
const labelStyle = {
  paddingRight: 5,
}

export const Tooltip = ({ payload = [], label }) => {
  const payloadSorted = sortBy(payload, 'name')
  console.log('hello Tooltip', { payload, payloadSorted, label })
  return (
    <div style={popupStyle}>
      <div style={titleStyle}>{label}</div>
      {payloadSorted.map((p, i) => {
        const color = 'black'

        return (
          <div key={i} style={{ ...rowStyle, color }}>
            <div style={labelStyle}>{p.name}</div>
            <div>{p.value}</div>
          </div>
        )
      })}
    </div>
  )
}
