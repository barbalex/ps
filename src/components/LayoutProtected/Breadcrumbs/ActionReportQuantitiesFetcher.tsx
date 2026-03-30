import { memo } from 'react'

import { useActionReportQuantitiesNavData } from '../../../modules/useActionReportQuantitiesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionReportQuantitiesFetcher = memo(
  ({ params, ...other }: { params: Record<string, string> }) => {
    const { navData } = useActionReportQuantitiesNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
