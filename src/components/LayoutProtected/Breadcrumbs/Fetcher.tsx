import { Loading } from '../../shared/Loading.tsx'
import { Crumb } from './Crumb/index.tsx'

// pass on TransitionGroup's props
export const Fetcher = ({ fetcherName, fetcherModule, params, ...other }) => {
  console.log('Breadcrumbs.Fetcher', {
    fetcherName,
    params,
    other,
  })

  // need to pass in params
  // If not: When navigating up the tree while transitioning out lower levels,
  // those bookmark components will not have their params anymore and error
  const res = fetcherModule?.[fetcherName]?.(params)
  const navData = res?.navData
  const loading = !!res?.loading

  console.log('Breadcrumbs.Fetcher', {
    res,
    loading,
    navData,
  })

  // TODO: loading remains true and result never arrives
  // if (loading) return <Loading width={120} />
  if (!navData.label) return null

  // this prevents:
  // the compiler provokes: "Error: Rendered fewer hooks than expected"
  // return null

  // return (
  //   <div
  //     // key={`${navData.id}`}
  //     navData={navData}
  //     {...other}
  //   />
  // )

  // TODO: navData.id does not exist
  return (
    <Crumb
      key={`${navData.id}`}
      // key={JSON.stringify(navData)}
      navData={navData}
      {...other}
    />
  )
}
