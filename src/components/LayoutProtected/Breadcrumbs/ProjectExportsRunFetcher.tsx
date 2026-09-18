import { useProjectExportsRunNavData } from '../../../modules/useProjectExportsRunNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectExportsRunNavData>[0]
}

export const ProjectExportsRunFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useProjectExportsRunNavData(params)
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
