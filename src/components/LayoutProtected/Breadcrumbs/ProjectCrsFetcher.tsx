import { useProjectCrsNavData } from '../../../modules/useProjectCrsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectCrsNavData>[0]
}

export const ProjectCrsFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useProjectCrsNavData(params)
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
