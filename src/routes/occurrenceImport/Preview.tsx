import { memo } from 'react'
import { Occurrences as Occurrence } from '../../generated/client'

const containerStyle = {
  overflow: 'auto',
  width: '100%',
  maxHeight: 300,
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
  border: '1px solid grey',
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

export const Preview = memo(({ occurrences, occurrenceFields }: Props) => (
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
        {occurrences.slice(0, 5).map((o) => (
          <tr key={o.occurrence_id}>
            {occurrenceFields.map((f) => (
              <td key={f} style={bocyCellStyle}>
                {o.data[f]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
))
