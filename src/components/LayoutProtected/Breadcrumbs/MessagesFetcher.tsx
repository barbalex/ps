import { useMessagesNavData } from '../../../modules/useMessagesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params?: Record<string, string>
}

export const MessagesFetcher = ({ params, ...other }: Props) => {
  // useMessagesNavData takes no params; the passed value is ignored at runtime
  const { navData } = (useMessagesNavData as (
    params?: Record<string, string>,
  ) => ReturnType<typeof useMessagesNavData>)(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
