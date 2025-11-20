import { useState, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'

import { Fetcher } from './Fetcher.tsx'

// pass on TransitionGroup's props
export const FetcherImporter = ({ fetcherName, ...other }) => {
  const [fetcherModule, setFetcherModule] = useState(null)
  // need to get params here and pass as props otherwise
  // causes the compiler to: "Error: Rendered fewer hooks than expected"
  const params = useParams({ strict: false })

  useEffect(() => {
    // return the module, not the hook as that would already be called
    import(`../../../modules/${fetcherName}.ts`).then((module) => {
      setFetcherModule(module)
    })
  }, [fetcherName])

  if (!fetcherModule) return null

  return (
    <Fetcher
      fetcherName={fetcherName}
      fetcherModule={fetcherModule}
      {...other}
      params={params}
    />
  )
}
