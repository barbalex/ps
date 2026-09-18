import { useActionReportNavData } from '../../../modules/useActionReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionReportFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useActionReportNavData(
    params as Parameters<typeof useActionReportNavData>[0],
  )

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
