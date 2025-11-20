import { useMessagesNavData } from '../../../modules/useMessagesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const MessagesFetcher = ({ params, ...other }) => {
  const { navData } = useMessagesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
