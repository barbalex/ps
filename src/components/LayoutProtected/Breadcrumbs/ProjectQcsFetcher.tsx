import { useProjectQcsNavData } from '../../../modules/useProjectQcsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectQcsFetcher = ({ params, ...other }) => {
  const { navData } = useProjectQcsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
