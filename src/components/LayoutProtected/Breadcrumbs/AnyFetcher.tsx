// no more in use due to weird problems
import { FetcherReturner } from './FetcherReturner.tsx'

// pass on TransitionGroup's props
export const AnyFetcher = ({ fetcherModule, params, ...other }) => {
  // need to pass in params
  // If not: When navigating up the tree while transitioning out lower levels,
  // those bookmark components will not have their params anymore and error
  const { navData } = fetcherModule(params)

  // TODO: loading remains true and result never arrives
  if (!navData?.label) return null

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
