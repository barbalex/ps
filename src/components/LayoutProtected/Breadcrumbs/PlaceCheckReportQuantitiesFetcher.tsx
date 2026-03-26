import { memo } from 'react'

import { usePlaceCheckReportQuantitiesNavData } from '../../../modules/usePlaceCheckReportQuantitiesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceCheckReportQuantitiesFetcher = memo(
  ({ params, ...other }: { params: Record<string, string> }) => {
    const { navData } = usePlaceCheckReportQuantitiesNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
