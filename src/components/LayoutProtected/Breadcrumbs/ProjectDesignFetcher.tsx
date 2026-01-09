import { useProjectConfigurationNavData } from '../../../modules/useProjectConfigurationNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectDesignFetcher = ({ params, ...other }) => {
  const { navData } = useProjectConfigurationNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
