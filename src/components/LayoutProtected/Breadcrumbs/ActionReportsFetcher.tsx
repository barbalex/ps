import { useActionReportsNavData } from '../../../modules/useActionReportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionReportsFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useActionReportsNavData(
    params as Parameters<typeof useActionReportsNavData>[0],
  )

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
