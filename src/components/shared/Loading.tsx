import { memo } from 'react'
import { Spinner } from '@fluentui/react-components'

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
}

export const Loading = memo(({ label, alignLeft = false, size="" }) => (
  <div
    style={{
      ...containerStyle,
      justifyContent: alignLeft ? 'flex-start' : 'center',
    }}
  >
    <Spinner
      labelPosition="below"
      label={label}
    />
  </div>
))
