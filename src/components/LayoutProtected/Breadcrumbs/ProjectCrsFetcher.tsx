import { useProjectCrsNavData } from '../../../modules/useProjectCrsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectCrsFetcher = ({ params, ...other }) => {
  const { navData } = useProjectCrsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
