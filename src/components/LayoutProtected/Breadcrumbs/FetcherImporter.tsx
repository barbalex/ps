import { memo, useState, useEffect } from 'react'

import { Fetcher } from './Fetcher.tsx'
import { Loading } from '../../shared/Loading.tsx'

// pass on TransitionGroup's props
export const FetcherImporter = memo(({ fetcherName, ...other }) => {
  const [fetcherModule, setFetcherModule] = useState(null)

  useEffect(() => {
    // return the module, not the hook as that would already be called
    import(`../../../modules/${fetcherName}.ts`).then((module) => {
      setFetcherModule(module)
    })
  }, [fetcherName])

  if (!fetcherModule) return <Loading width={120} />

  return (
    <Fetcher
      fetcherName={fetcherName}
      fetcherModule={fetcherModule}
      {...other}
    />
  )
})
