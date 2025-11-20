import { useProjectNavData } from '../../../modules/useProjectNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectFetcher = ({ params, ...other }) => {
  const { navData } = useProjectNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
