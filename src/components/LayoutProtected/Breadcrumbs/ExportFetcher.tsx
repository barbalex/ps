import { useExportNavData } from '../../../modules/useExportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useExportNavData>[0]
}

export const ExportFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useExportNavData(params)
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
