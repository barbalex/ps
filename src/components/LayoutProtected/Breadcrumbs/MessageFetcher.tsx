import { useMessageNavData } from '../../../modules/useMessageNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    messageId: string
  }
}

export const MessageFetcher = ({ params, ...other }: Props) => {
  const { navData } = useMessageNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
