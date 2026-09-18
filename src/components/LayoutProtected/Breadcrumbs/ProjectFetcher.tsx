import { useProjectNavData } from '../../../modules/useProjectNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectNavData>[0]
}

export const ProjectFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useProjectNavData(params)
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
