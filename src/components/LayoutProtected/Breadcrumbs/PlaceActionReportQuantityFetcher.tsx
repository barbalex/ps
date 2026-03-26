import { memo } from 'react'

import { usePlaceActionReportQuantityNavData } from '../../../modules/usePlaceActionReportQuantityNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceActionReportQuantityFetcher = memo(
  ({ params, ...other }: { params: Record<string, string> }) => {
    const { navData } = usePlaceActionReportQuantityNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
