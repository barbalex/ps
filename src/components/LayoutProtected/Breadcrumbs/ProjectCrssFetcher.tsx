import { useProjectCrssNavData } from '../../../modules/useProjectCrssNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectCrssNavData>[0]
}

export const ProjectCrssFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useProjectCrssNavData(params)
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
