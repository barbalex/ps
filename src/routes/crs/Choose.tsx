import { memo, useCallback, useState } from 'react'
import { Button } from '@fluentui/react-components'

const containerStyle = {
  borderTop: '1px solid rgb(55, 118, 28)',
  borderBottom: '1px solid rgb(55, 118, 28)',
  padding: '10px 0',
}

export const Choose = memo(() => {
  const [data, setData] = useState([])

  const onClickLoad = useCallback(async () => {
    // dynamically import big json file crs.json
    const { default: data } = await import('./crs.json')
    setData(data)
  }, [])

  console.log('Choose, data:', data)

  return (
    <div style={containerStyle}>
      <Button onClick={onClickLoad}>Load List of CRS</Button>
    </div>
  )
})
