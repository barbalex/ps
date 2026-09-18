import { useQueuedOperationNavData } from '../../../modules/useQueuedOperationNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useQueuedOperationNavData>[0]
}

export const QueuedOperationFetcher = ({ params, ...other }: Props) => {
  const { navData } = useQueuedOperationNavData(params)

  return (
    <FetcherReturner
      key={navData?.ownUrl}
      navData={navData}
      {...other}
    />
  )
}
