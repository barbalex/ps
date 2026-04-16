import { useQueuedOperationsNavData } from '../../../modules/useQueuedOperationsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const QueuedOperationsFetcher = ({ ...other }) => {
  const { navData } = useQueuedOperationsNavData()

  return <FetcherReturner key={navData?.ownUrl} navData={navData} {...other} />
}
