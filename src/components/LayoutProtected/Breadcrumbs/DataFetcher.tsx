import { useDataBreadcrumbData } from '../../../modules/useDataBreadcrumbData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  // passed on by TransitionGroup at runtime
  in?: boolean
}

export const DataFetcher = (params: Props) => {
  const { navData } = useDataBreadcrumbData()

  return (
    <FetcherReturner
      key={navData?.ownUrl}
      navData={navData}
      {...params}
    />
  )
}
