import { useProjectExportNavData } from '../../../modules/useProjectExportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectExportNavData>[0]
}

export const ProjectExportFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useProjectExportNavData(params)
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
