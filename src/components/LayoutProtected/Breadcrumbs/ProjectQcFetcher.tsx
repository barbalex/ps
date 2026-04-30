import { useProjectQcNavData } from '../../../modules/useProjectQcNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectQcFetcher = ({ params, ...other }) => {
  const { navData } = useProjectQcNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
