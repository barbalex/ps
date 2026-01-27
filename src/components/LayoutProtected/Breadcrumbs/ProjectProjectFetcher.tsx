import { useProjectProjectNavData } from '../../../modules/useProjectProjectNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectProjectFetcher = ({ params, ...other }) => {
  const { navData } = useProjectProjectNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
