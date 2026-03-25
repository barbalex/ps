import { useProjectQcsRunNavData } from '../../../modules/useProjectQcsRunNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectQcsRunFetcher = ({ params, ...other }) => {
  const { navData } = useProjectQcsRunNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
