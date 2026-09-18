import { useProjectConfigurationNavData } from '../../../modules/useProjectConfigurationNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectConfigurationNavData>[0]
}

export const ProjectDesignFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useProjectConfigurationNavData(params)
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
