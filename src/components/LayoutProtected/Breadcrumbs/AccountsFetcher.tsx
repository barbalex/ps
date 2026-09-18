import { useAccountsNavData } from '../../../modules/useAccountsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const AccountsFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useAccountsNavData(
    params as Parameters<typeof useAccountsNavData>[0],
  )

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
