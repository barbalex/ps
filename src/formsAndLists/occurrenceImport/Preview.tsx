import { memo } from 'react'

const emptyContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'auto',
  scrollbarWidth: 'thin',
  scrollbarGutter: 'auto',
  width: '100%',
  height: 250,
}
const containerStyle = {
  overflow: 'auto',
  scrollbarWidth: 'thin',
  scrollbarGutter: 'auto',
  width: '100%',
  maxHeight: 250,
}
const fontStyle = {
  fontSize: '0.8em',
  lineHeight: '1.2em',
}
const tableStyle = {
  ...fontStyle,
  borderCollapse: 'collapse',
}
const headStyle = {
  position: 'sticky',
  top: 0,
  backgroundColor: '#e2f7e2',
  fontWeight: 'bold',
  zIndex: 1,
}
const cellStyle = {
  border: '1px solid rgb(210 210 210)',
  padding: 2,
  ...fontStyle,
}
const headerCellStyle = {
  ...cellStyle,
  overflowWrap: 'break-word',
  fontWeight: 'bold',
}
const bocyCellStyle = {
  ...cellStyle,
  overflowWrap: 'anywhere',
}

export const Preview = memo(({ occurrences, occurrenceFields }) => {
  if (!occurrences) {
    return <div style={emptyContainerStyle}>loading preview...</div>
  }
  if (!occurrences.length) {
    return <div style={emptyContainerStyle}>no data to preview</div>
  }
  const occurrenceFieldsWithLabel = ['label', ...occurrenceFields]

  return (
    <div style={containerStyle}>
      <table
        aria-label="Preview"
        style={tableStyle}
        width={occurrenceFieldsWithLabel.length * 60}
      >
        <thead style={headStyle}>
          <tr>
            {occurrenceFieldsWithLabel.map((f) => (
              <th
                key={f}
                style={headerCellStyle}
              >
                {f}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {occurrences.slice(0, 50).map((o) => (
            <tr key={o.occurrence_id}>
              {occurrenceFieldsWithLabel.map((f, i) => (
                <td
                  key={f}
                  style={bocyCellStyle}
                >
                  {f === 'label' && i === 0 ? o.label : o.data[f]}
                </td>
              ))}
            </tr>
          ))}
          {occurrences.length > 50 && (
            <tr>
              <td
                colSpan={occurrenceFieldsWithLabel.length}
                style={bocyCellStyle}
              >
                and {occurrences.length - 50} more rows...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
})
