import { memo } from 'react'

export const Location = memo(({ location }) => {
  const lng = Math.round(location?.lng * 10000000) / 10000000
  const lat = Math.round(location?.lat * 10000000) / 10000000

  return (
    <>
      <h3>Location</h3>
      <p>{`WGS84: ${lng} / ${lat}`}</p>
    </>
  )
})
