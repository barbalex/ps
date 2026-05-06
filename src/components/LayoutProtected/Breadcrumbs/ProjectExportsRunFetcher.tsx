import { useProjectExportsRunNavData } from '../../../modules/useProjectExportsRunNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectExportsRunFetcher = ({ params, ...other }) => {
  const { navData } = useProjectExportsRunNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
