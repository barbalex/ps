import { useProjectCrssNavData } from '../../../modules/useProjectCrssNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectCrssFetcher = ({ params, ...other }) => {
  const { navData } = useProjectCrssNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
