// no more in use due to weird errors
import { useState, useEffect } from 'react'

import { AnyFetcher } from './AnyFetcher.tsx'

// pass on TransitionGroup's props
export const AnyFetcherImporter = ({ fetcherName, params, ...other }) => {
  const [fetcherModule, setFetcherModule] = useState(null)

  useEffect(() => {
    if (fetcherModule || !fetcherName) return

    // return the module, not the hook as that would already be called
    import(`../../../modules/${fetcherName}.ts`).then((module) => {
      setFetcherModule(module)
    })
  }, [fetcherName, fetcherModule])

  if (!fetcherModule || !fetcherName) return null

  return (
    <AnyFetcher
      params={params}
      fetcherModule={fetcherModule[fetcherName]}
      {...other}
    />
  )
}
