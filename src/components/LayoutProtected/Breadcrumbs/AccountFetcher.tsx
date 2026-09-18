import { useAccountNavData } from '../../../modules/useAccountNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const AccountFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useAccountNavData(
    params as Parameters<typeof useAccountNavData>[0],
  )

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
