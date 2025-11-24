import { useDataBreadcrumbData } from '../../../modules/useDataBreadcrumbData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const DataFetcher = (params) => {
  const { navData } = useDataBreadcrumbData()

  return (
    <FetcherReturner
      key={navData?.ownUrl}
      navData={navData}
      {...params}
    />
  )
}
