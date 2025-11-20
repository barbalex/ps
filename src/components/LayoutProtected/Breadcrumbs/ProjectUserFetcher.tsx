import { useProjectUserNavData } from '../../../modules/useProjectUserNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectUserFetcher = ({ params, ...other }) => {
  const { navData } = useProjectUserNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
