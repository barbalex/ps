import { memo } from 'react'
import { Button } from '@fluentui/react-components'

const containerStyle = {
  borderTop: '1px solid rgb(55, 118, 28)',
  borderBottom: '1px solid rgb(55, 118, 28)',
  padding: '10px 0',
}

export const Choose = memo(() => {
  return (
    <div style={containerStyle}>
      <Button>Load List of CRS</Button>
    </div>
  )
})
