import { useActionsNavData } from '../../../modules/useActionsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionsFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useActionsNavData(
    params as Parameters<typeof useActionsNavData>[0],
  )

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
