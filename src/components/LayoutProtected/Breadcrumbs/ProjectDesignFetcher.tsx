import { useProjectDesignNavData } from '../../../modules/useProjectDesignNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectDesignFetcher = ({ params, ...other }) => {
  const { navData } = useProjectDesignNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
