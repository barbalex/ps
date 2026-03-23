import { memo } from 'react'

import { usePlaceReportQuantitiesNavData } from '../../../modules/usePlaceReportQuantitiesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceReportQuantitiesFetcher = memo(
  ({ params, ...other }: { params: Record<string, string> }) => {
    const { navData } = usePlaceReportQuantitiesNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
