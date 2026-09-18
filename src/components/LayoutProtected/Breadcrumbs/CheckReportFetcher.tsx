import { useCheckReportNavData } from '../../../modules/useCheckReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useCheckReportNavData>[0]
}

export const CheckReportFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useCheckReportNavData(params)
  // navData.id does not exist on NavData; bridge type-only
  const navData = navDataRaw as typeof navDataRaw & { id?: string }

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
