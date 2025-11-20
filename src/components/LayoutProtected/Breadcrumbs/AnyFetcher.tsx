import { FetcherReturner } from './FetcherReturner.tsx'

// pass on TransitionGroup's props
export const AnyFetcher = ({ fetcherModule, params, ...other }) => {
  // need to pass in params
  // If not: When navigating up the tree while transitioning out lower levels,
  // those bookmark components will not have their params anymore and error
  const { navData } = fetcherModule(params)

  // console.log('Breadcrumbs.Fetcher, navData:', navData)

  // TODO: loading remains true and result never arrives
  if (!navData?.label) return null

  // TODO: navData.id does not exist
  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
