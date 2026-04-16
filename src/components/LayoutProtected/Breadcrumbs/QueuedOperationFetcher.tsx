import { useQueuedOperationNavData } from '../../../modules/useQueuedOperationNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const QueuedOperationFetcher = ({ params, ...other }) => {
  const { navData } = useQueuedOperationNavData(params)

  return (
    <FetcherReturner
      key={navData?.ownUrl}
      navData={navData}
      {...other}
    />
  )
}
