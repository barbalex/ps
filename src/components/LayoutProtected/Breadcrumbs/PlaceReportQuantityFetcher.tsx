import { memo } from 'react'

import { usePlaceReportQuantityNavData } from '../../../modules/usePlaceReportQuantityNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceReportQuantityFetcher = memo(
  ({ params, ...other }: { params: Record<string, string> }) => {
    const { navData } = usePlaceReportQuantityNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
