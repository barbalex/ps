import { useMessageNavData } from '../../../modules/useMessageNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const MessageFetcher = ({ params, ...other }) => {
  const { navData } = useMessageNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
