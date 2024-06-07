import { memo } from 'react'
import { Spinner } from '@fluentui/react-components'

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
}

export const Loading = memo(({ label }) => (
  <div style={containerStyle}>
    <Spinner labelPosition="below" label={label} />
  </div>
))
