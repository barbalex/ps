import { memo } from 'react'

export const Legend = memo(({ layer }) => {
  console.log('Legend, layer:', layer)

  return <div>{layer.label}</div>
})
