import { useProjectProjectNavData } from '../../../modules/useProjectProjectNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectProjectNavData>[0]
}

export const ProjectProjectFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useProjectProjectNavData(params)
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
