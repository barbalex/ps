import { memo } from 'react'

import { Occurrences as Occurrence } from '../../generated/client'

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
  backgroundColor: 'rgba(103, 216, 101, 0.07)',
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

interface Props {
  occurrences: Occurrence[]
  occurrenceFields: string[]
}

export const Preview = memo(({ occurrences, occurrenceFields }: Props) => {
  if (!occurrences) {
    return <div style={emptyContainerStyle}>loading preview...</div>
  }
  if (!occurrences.length) {
    return <div style={emptyContainerStyle}>no data to preview</div>
  }

  return (
    <div style={containerStyle}>
      <table
        aria-label="Preview"
        style={tableStyle}
        width={occurrenceFields.length * 60}
      >
        <thead style={headStyle}>
          <tr>
            {occurrenceFields.map((f) => (
              <th key={f} style={headerCellStyle}>
                {f}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {occurrences.slice(0, 50).map((o) => (
            <tr key={o.occurrence_id}>
              {occurrenceFields.map((f) => (
                <td key={f} style={bocyCellStyle}>
                  {o.data[f]}
                </td>
              ))}
            </tr>
          ))}
          {occurrences.length > 50 && (
            <tr>
              <td colSpan={occurrenceFields.length} style={bocyCellStyle}>
                and {occurrences.length - 50} more rows...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
})
