import { memo } from 'react'

import { usePlaceActionReportQuantitiesNavData } from '../../../modules/usePlaceActionReportQuantitiesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceActionReportQuantitiesFetcher = memo(
  ({ params, ...other }: { params: Record<string, string> }) => {
    const { navData } = usePlaceActionReportQuantitiesNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
