import { memo, useCallback, useState } from 'react'
import { Button } from '@fluentui/react-components'
import axios from 'redaxios'

const containerStyle = {
  borderTop: '1px solid rgb(55, 118, 28)',
  borderBottom: '1px solid rgb(55, 118, 28)',
  padding: '10px 0',
}

export const Choose = memo(() => {
  const [data, setData] = useState([])

  const onClickLoad = useCallback(async () => {
    let res
    try {
      res = await axios({
        method: 'get',
        url: 'https://spatialreference.org/crslist.json',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      return await db.notifications.create({
        data: createNotification({
          title: `Error loading CRS`,
          body: error.message,
          intent: 'error',
        }),
      })
    }
    console.log('Choose, res:', res)
  }, [])

  return (
    <div style={containerStyle}>
      <Button onClick={onClickLoad}>Load List of CRS</Button>
    </div>
  )
})
